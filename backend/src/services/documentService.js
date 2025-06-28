import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/database.js';
import { ragService } from './ragService.js';
import { logger } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/helpers.js';
import mammoth from 'mammoth';
import extractPdfText from 'pdf-text-extract';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async ensureStorageBucket() {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        logger.error('Error listing buckets:', listError);
        throw new Error('Failed to check storage buckets');
      }

      const bucketExists = buckets.some(bucket => bucket.name === 'documents');

      if (!bucketExists) {
        // Create the bucket
        const { data, error: createError } = await supabase.storage.createBucket('documents', {
          public: false,
          allowedMimeTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          fileSizeLimit: 10485760 // 10MB
        });

        if (createError) {
          logger.error('Error creating bucket:', createError);
          throw new Error('Failed to create storage bucket');
        }

        logger.info('Documents bucket created successfully');
      }
    } catch (error) {
      logger.error('Error ensuring storage bucket:', error);
      throw error;
    }
  }

  async uploadToStorage(file, companyId) {
    try {
      // Ensure bucket exists
      await this.ensureStorageBucket();

      const fileName = `${companyId}/${Date.now()}-${file.originalname}`;

      // Upload to Supabase Storage with retry
      const uploadOperation = async () => {
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) {
          logger.error('Error uploading to storage:', error);
          throw new Error('Failed to upload file to storage');
        }

        return data;
      };

      const data = await retryWithBackoff(uploadOperation, 3, 1000);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      return {
        fileName: file.originalname,
        filePath: fileName,
        fileUrl: urlData.publicUrl,
        fileSize: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      logger.error('Error in uploadToStorage:', error);
      throw error;
    }
  }

  async extractTextContent(file) {
    try {
      let text = '';

      switch (file.mimetype) {
        case 'application/pdf':
          const pdfData = await pdfParse(file.buffer);
          text = pdfData.text;
          break;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
          text = docxResult.value;
          break;

        case 'text/plain':
          text = file.buffer.toString('utf-8');
          break;

        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      return text.trim();
    } catch (error) {
      logger.error('Error extracting text content:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  async processDocument(file, companyId, userId) {
    try {
      // Upload file to storage
      const fileData = await this.uploadToStorage(file, companyId);

      // Extract text content
      const textContent = await this.extractTextContent(file);

      console.log(`Extracted text content length: ${textContent.length}`);

      // Store document metadata in database with retry
      const insertOperation = async () => {
        const { data: document, error } = await supabase
          .from('documents')
          .insert({
            company_id: companyId,
            user_id: userId,
            filename: fileData.fileName,
            file_type: file.mimetype.split('/')[1] || 'unknown',
            file_size: fileData.fileSize,
            content_length: textContent.length,
            file_url: fileData.fileUrl,
            status: 'processing',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          logger.error('Error storing document metadata:', error);
          throw new Error('Failed to store document metadata');
        } else{
          console.log('document saved successfully:', document);
        }

        return document;
      };

      const document = await retryWithBackoff(insertOperation, 3, 1000);

      // Process with RAG service in background
      try {
        const chunks = ragService.chunkText(textContent);
        const chunkCount = await ragService.storeDocumentChunks(
          companyId,
          document.id,
          chunks,
          {
            filename: fileData.fileName,
            file_type: file.mimetype,
            file_size: fileData.fileSize
          }
        );

        // Update document status with retry
        const updateOperation = async () => {
          const { error } = await supabase
            .from('documents')
            .update({
              status: 'processed',
              chunk_count: chunkCount,
              updated_at: new Date().toISOString()
            })
            .eq('id', document.id);

          if (error) {
            throw new Error('Failed to update document status');
          }
        };

        await retryWithBackoff(updateOperation, 3, 1000);

        logger.info(`Document processed successfully: ${fileData.fileName}`);
      } catch (ragError) {
        logger.error('Error processing with RAG:', ragError);

        // Update document status to failed with retry
        try {
          const updateFailedOperation = async () => {
            const { error } = await supabase
              .from('documents')
              .update({
                status: 'failed',
                updated_at: new Date().toISOString()
              })
              .eq('id', document.id);

            if (error) {
              throw new Error('Failed to update document status to failed');
            }
          };

          await retryWithBackoff(updateFailedOperation, 3, 1000);
        } catch (updateError) {
          logger.error('Failed to update document status to failed:', updateError);
        }
      }

      return document;
    } catch (error) {
      logger.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  async getDocuments(companyId, limit = 50, offset = 0) {
    try {
      const getOperation = async () => {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          logger.error('Error fetching documents:', error);
          throw new Error('Failed to fetch documents');
        }

        return data || [];
      };

      return await retryWithBackoff(getOperation, 3, 1000);
    } catch (error) {
      logger.error('Error in getDocuments:', error);
      throw error;
    }
  }

  async deleteDocument(documentId, companyId) {
    try {
      // Get document details first with retry
      const fetchOperation = async () => {
        const { data: document, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .eq('company_id', companyId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // Document not found in database
            logger.warn(`Document ${documentId} not found in database, may have been already deleted`);
            return null;
          }
          throw fetchError;
        }

        return document;
      };

      const document = await retryWithBackoff(fetchOperation, 3, 1000);

      if (!document) {
        // Document doesn't exist in database, consider it already deleted
        logger.info(`Document ${documentId} not found in database, considering it deleted`);
        return { success: true, message: 'Document not found in database' };
      }

      // Delete from RAG service
      try {
        await ragService.deleteDocumentChunks(companyId, documentId);
      } catch (ragError) {
        logger.error('Error deleting from RAG service:', ragError);
        // Continue with deletion even if RAG deletion fails
      }

      // Delete from storage with retry
      if (document.file_url) {
        try {
          const filePath = document.file_url.split('/').slice(-2).join('/');

          const storageDeleteOperation = async () => {
            const { error: storageError } = await supabase.storage
              .from('documents')
              .remove([filePath]);

            if (storageError) {
              logger.error('Error deleting from storage:', storageError);
              throw storageError;
            }
          };

          await retryWithBackoff(storageDeleteOperation, 3, 1000);
        } catch (storageError) {
          logger.error('Failed to delete from storage after retries:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database with retry
      const dbDeleteOperation = async () => {
        const { error: dbError } = await supabase
          .from('documents')
          .delete()
          .eq('id', documentId)
          .eq('company_id', companyId);

        if (dbError) {
          logger.error('Error deleting from database:', dbError);
          throw new Error('Failed to delete document from database');
        }
      };

      await retryWithBackoff(dbDeleteOperation, 3, 1000);

      logger.info(`Document deleted successfully: ${document.filename}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw error;
    }
  }

  async reprocessDocument(documentId, companyId) {
    try {
      // Get document details with retry
      const fetchOperation = async () => {
        const { data: document, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .eq('company_id', companyId)
          .single();

        if (fetchError || !document) {
          throw new Error('Document not found');
        }

        return document;
      };

      const document = await retryWithBackoff(fetchOperation, 3, 1000);

      // Update status to processing with retry
      const updateProcessingOperation = async () => {
        const { error } = await supabase
          .from('documents')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);

        if (error) {
          throw new Error('Failed to update status to processing');
        }
      };

      await retryWithBackoff(updateProcessingOperation, 3, 1000);

      // Download file from storage and reprocess with retry
      const downloadOperation = async () => {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('documents')
          .download(document.file_url.split('/').slice(-2).join('/'));

        if (downloadError) {
          throw new Error('Failed to download file for reprocessing');
        }

        return fileData;
      };

      const fileData = await retryWithBackoff(downloadOperation, 3, 1000);

      // Create file object for reprocessing
      const file = {
        buffer: Buffer.from(await fileData.arrayBuffer()),
        mimetype: document.file_type === 'pdf' ? 'application/pdf' :
          document.file_type === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
            'text/plain',
        originalname: document.filename
      };

      // Extract text and reprocess
      const textContent = await this.extractTextContent(file);

      // Delete old chunks
      await ragService.deleteDocumentChunks(companyId, documentId);

      // Create new chunks
      const chunks = ragService.chunkText(textContent);
      const chunkCount = await ragService.storeDocumentChunks(
        companyId,
        documentId,
        chunks,
        {
          filename: document.filename,
          file_type: file.mimetype,
          file_size: document.file_size
        }
      );

      // Update document status with retry
      const updateSuccessOperation = async () => {
        const { error } = await supabase
          .from('documents')
          .update({
            status: 'processed',
            chunk_count: chunkCount,
            content_length: textContent.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);

        if (error) {
          throw new Error('Failed to update document status');
        }
      };

      await retryWithBackoff(updateSuccessOperation, 3, 1000);

      logger.info(`Document reprocessed successfully: ${document.filename}`);
      return { success: true };
    } catch (error) {
      logger.error('Error reprocessing document:', error);

      // Update status to failed with retry
      try {
        const updateFailedOperation = async () => {
          const { error } = await supabase
            .from('documents')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', documentId);

          if (error) {
            throw new Error('Failed to update status to failed');
          }
        };

        await retryWithBackoff(updateFailedOperation, 3, 1000);
      } catch (updateError) {
        logger.error('Failed to update status to failed:', updateError);
      }

      throw error;
    }
  }

  async getDocumentStats(companyId) {
    try {
      const getStatsOperation = async () => {
        const { data: documents, error } = await supabase
          .from('documents')
          .select('status, file_size, chunk_count')
          .eq('company_id', companyId);

        if (error) {
          logger.error('Error fetching document stats:', error);
          throw new Error('Failed to fetch document stats');
        }

        return documents;
      };

      const documents = await retryWithBackoff(getStatsOperation, 3, 1000);

      const stats = {
        total_documents: documents.length,
        processed_documents: documents.filter(d => d.status === 'processed').length,
        processing_documents: documents.filter(d => d.status === 'processing').length,
        failed_documents: documents.filter(d => d.status === 'failed').length,
        total_size: documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0),
        total_chunks: documents.reduce((sum, doc) => sum + (doc.chunk_count || 0), 0)
      };

      return stats;
    } catch (error) {
      logger.error('Error getting document stats:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();