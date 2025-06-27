import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/database.js';
import { ragService } from './ragService.js';
import { logger } from '../utils/logger.js';
import mammoth from 'mammoth';
import extractPdfText from 'pdf-text-extract';

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
      
      // Upload to Supabase Storage
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
        text = await new Promise((resolve, reject) => {
          extractPdfText(file.buffer, { splitPages: false }, (err, pages) => {
            if (err) return reject(err);
            resolve(pages.join('\n'));
          });
        });
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
      
      // Store document metadata in database
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
      }

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

        // Update document status
        await supabase
          .from('documents')
          .update({
            status: 'processed',
            chunk_count: chunkCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', document.id);

        logger.info(`Document processed successfully: ${fileData.fileName}`);
      } catch (ragError) {
        logger.error('Error processing with RAG:', ragError);
        
        // Update document status to failed
        await supabase
          .from('documents')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', document.id);
      }

      return document;
    } catch (error) {
      logger.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  async getDocuments(companyId, limit = 50, offset = 0) {
    try {
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
    } catch (error) {
      logger.error('Error in getDocuments:', error);
      throw error;
    }
  }

  async deleteDocument(documentId, companyId) {
    try {
      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('company_id', companyId)
        .single();

      if (fetchError || !document) {
        throw new Error('Document not found');
      }

      // Delete from RAG service
      try {
        await ragService.deleteDocumentChunks(companyId, documentId);
      } catch (ragError) {
        logger.error('Error deleting from RAG service:', ragError);
        // Continue with deletion even if RAG deletion fails
      }

      // Delete from storage
      if (document.file_url) {
        const fileName = document.file_url.split('/').pop();
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([`${companyId}/${fileName}`]);

        if (storageError) {
          logger.error('Error deleting from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('company_id', companyId);

      if (dbError) {
        logger.error('Error deleting from database:', dbError);
        throw new Error('Failed to delete document from database');
      }

      logger.info(`Document deleted successfully: ${document.filename}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw error;
    }
  }

  async reprocessDocument(documentId, companyId) {
    try {
      // Get document details
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('company_id', companyId)
        .single();

      if (fetchError || !document) {
        throw new Error('Document not found');
      }

      // Update status to processing
      await supabase
        .from('documents')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      // Download file from storage and reprocess
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.file_url.split('/').slice(-2).join('/'));

      if (downloadError) {
        throw new Error('Failed to download file for reprocessing');
      }

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

      // Update document status
      await supabase
        .from('documents')
        .update({
          status: 'processed',
          chunk_count: chunkCount,
          content_length: textContent.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      logger.info(`Document reprocessed successfully: ${document.filename}`);
      return { success: true };
    } catch (error) {
      logger.error('Error reprocessing document:', error);
      
      // Update status to failed
      await supabase
        .from('documents')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);
      
      throw error;
    }
  }

  async getDocumentStats(companyId) {
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('status, file_size, chunk_count')
        .eq('company_id', companyId);

      if (error) {
        logger.error('Error fetching document stats:', error);
        throw new Error('Failed to fetch document stats');
      }

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