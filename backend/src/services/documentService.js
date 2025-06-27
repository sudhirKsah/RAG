import fs from 'fs/promises';
import path from 'path';
// import pdfParse from 'pdf-parse';
// At the top of the file
import pdfExtract from 'pdf-text-extract';
// import * as pdfjsLib from 'pdfjs-dist';
// import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js';
// import { getDocument } from 'pdfjs-dist';
import mammoth from 'mammoth';
import { supabase } from '../config/database.js';
import { ragService } from './ragService.js';
import { logger } from '../utils/logger.js';

export class DocumentService {
  constructor() {
    this.allowedTypes = ['pdf', 'docx', 'txt'];
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
  }

  // Process uploaded document
  async processDocument(file, companyId, userId) {
    try {
      // Validate file
      this.validateFile(file);

      // Extract text from file
      const extractedText = await this.extractText(file);
      
      // Store document metadata in Supabase
      const documentRecord = await this.storeDocumentMetadata({
        company_id: companyId,
        user_id: userId,
        filename: file.originalname,
        file_type: this.getFileExtension(file.originalname),
        file_size: file.size,
        content_length: extractedText.length,
        status: 'processing'
      });

      // Upload file to Supabase Storage
      const fileUrl = await this.uploadToStorage(file, companyId, documentRecord.id);

      // Chunk the text
      const chunks = ragService.chunkText(extractedText);

      // Store chunks with embeddings
      await ragService.storeDocumentChunks(
        companyId,
        documentRecord.id,
        chunks,
        {
          filename: file.originalname,
          file_type: this.getFileExtension(file.originalname),
          file_url: fileUrl
        }
      );

      // Update document status
      await this.updateDocumentStatus(documentRecord.id, 'processed', {
        chunk_count: chunks.length,
        file_url: fileUrl
      });

      logger.info(`Document processed successfully: ${documentRecord.id}`);
      
      return {
        id: documentRecord.id,
        filename: file.originalname,
        status: 'processed',
        chunk_count: chunks.length,
        content_length: extractedText.length,
        file_url: fileUrl
      };
    } catch (error) {
      logger.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  // Validate uploaded file
  validateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    const fileExtension = this.getFileExtension(file.originalname);
    if (!this.allowedTypes.includes(fileExtension)) {
      throw new Error(`File type ${fileExtension} not supported. Allowed types: ${this.allowedTypes.join(', ')}`);
    }
  }

  // Extract text from different file types
  async extractText(file) {
    const fileExtension = this.getFileExtension(file.originalname);
    
    switch (fileExtension) {
      case 'pdf':
        return await this.extractFromPDF(file.buffer);
      case 'docx':
        return await this.extractFromDOCX(file.buffer);
      case 'txt':
        return file.buffer.toString('utf-8');
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  // Extract text from PDF

  async extractFromPDF(buffer) {
    try {
      return await new Promise((resolve, reject) => {
        pdfExtract(buffer, { type: 'buffer' }, (err, pages) => {
          if (err) {
            logger.error('Error extracting text from PDF:', err);
            return reject(new Error('Failed to extract text from PDF'));
          }
          // `pages` is an array of strings per page
          const fullText = pages.join('\n');
          resolve(fullText);
        });
      });
    } catch (error) {
      logger.error('Error in extractFromPDF:', error);
      throw new Error('PDF parsing failed');
    }
  }
  


  // Extract text from DOCX
  async extractFromDOCX(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      logger.error('Error extracting DOCX text:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  // Store document metadata in Supabase
  async storeDocumentMetadata(metadata) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          ...metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error storing document metadata:', error);
      throw new Error('Failed to store document metadata');
    }
  }

  // Upload file to Supabase Storage
  async uploadToStorage(file, companyId, documentId) {
    try {
      const fileName = `${companyId}/${documentId}/${file.originalname}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      logger.error('Error uploading to storage:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  // Update document status
  async updateDocumentStatus(documentId, status, additionalData = {}) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          status,
          ...additionalData,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating document status:', error);
      throw new Error('Failed to update document status');
    }
  }

  // Get documents for a company
  async getDocuments(companyId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting documents:', error);
      throw new Error('Failed to get documents');
    }
  }

  // Delete document
  async deleteDocument(documentId, companyId) {
    try {
      // Delete from vector database
      await ragService.deleteDocumentChunks(companyId, documentId);

      // Delete from storage
      const { data: document } = await supabase
        .from('documents')
        .select('filename')
        .eq('id', documentId)
        .eq('company_id', companyId)
        .single();

      if (document) {
        const fileName = `${companyId}/${documentId}/${document.filename}`;
        await supabase.storage
          .from('documents')
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('company_id', companyId);

      if (error) throw error;

      logger.info(`Document deleted successfully: ${documentId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  // Get document statistics
  async getDocumentStats(companyId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('status, file_size, chunk_count')
        .eq('company_id', companyId);

      if (error) throw error;

      const stats = {
        total_documents: data.length,
        processed_documents: data.filter(d => d.status === 'processed').length,
        processing_documents: data.filter(d => d.status === 'processing').length,
        failed_documents: data.filter(d => d.status === 'failed').length,
        total_size: data.reduce((sum, d) => sum + (d.file_size || 0), 0),
        total_chunks: data.reduce((sum, d) => sum + (d.chunk_count || 0), 0)
      };

      return stats;
    } catch (error) {
      logger.error('Error getting document stats:', error);
      throw new Error('Failed to get document stats');
    }
  }

  // Reprocess document
  async reprocessDocument(documentId, companyId) {
    try {
      // Get document metadata
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('company_id', companyId)
        .single();

      if (error) throw error;
      if (!document) throw new Error('Document not found');

      // Download file from storage
      const fileName = `${companyId}/${documentId}/${document.filename}`;
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(fileName);

      if (downloadError) throw downloadError;

      // Convert to buffer
      const buffer = await fileData.arrayBuffer();
      const file = {
        originalname: document.filename,
        buffer: Buffer.from(buffer),
        size: document.file_size,
        mimetype: this.getMimeType(document.file_type)
      };

      // Extract text
      const extractedText = await this.extractText(file);

      // Update status to processing
      await this.updateDocumentStatus(documentId, 'processing');

      // Delete old chunks
      await ragService.deleteDocumentChunks(companyId, documentId);

      // Chunk and store new embeddings
      const chunks = ragService.chunkText(extractedText);
      await ragService.storeDocumentChunks(
        companyId,
        documentId,
        chunks,
        {
          filename: document.filename,
          file_type: document.file_type,
          file_url: document.file_url
        }
      );

      // Update status to processed
      await this.updateDocumentStatus(documentId, 'processed', {
        chunk_count: chunks.length,
        content_length: extractedText.length
      });

      logger.info(`Document reprocessed successfully: ${documentId}`);
      return true;
    } catch (error) {
      logger.error('Error reprocessing document:', error);
      await this.updateDocumentStatus(documentId, 'failed');
      throw new Error('Failed to reprocess document');
    }
  }

  // Helper methods
  getFileExtension(filename) {
    return path.extname(filename).toLowerCase().substring(1);
  }

  getMimeType(extension) {
    const mimeTypes = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

export const documentService = new DocumentService();