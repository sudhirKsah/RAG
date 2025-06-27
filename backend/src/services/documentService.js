import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  async uploadFile(file, userId, chatbotId) {
    try {
      // Ensure bucket exists
      await this.ensureStorageBucket();

      const fileName = `${userId}/${chatbotId}/${Date.now()}-${file.originalname}`;
      
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
      logger.error('Error in uploadFile:', error);
      throw error;
    }
  }

  async processDocument(fileData, content, userId, chatbotId) {
    try {
      // Store document metadata in database
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          chatbot_id: chatbotId,
          filename: fileData.fileName,
          file_path: fileData.filePath,
          file_url: fileData.fileUrl,
          file_size: fileData.fileSize,
          mime_type: fileData.mimeType,
          content: content,
          status: 'processed',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Error storing document metadata:', error);
        throw new Error('Failed to store document metadata');
      }

      logger.info(`Document processed successfully: ${fileData.fileName}`);
      return data;
    } catch (error) {
      logger.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  async getDocuments(userId, chatbotId = null) {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (chatbotId) {
        query = query.eq('chatbot_id', chatbotId);
      }

      const { data, error } = await query;

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

  async deleteDocument(documentId, userId) {
    try {
      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !document) {
        throw new Error('Document not found');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        logger.error('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', userId);

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

  extractTextContent(file) {
    // Simple text extraction - in production, you'd want more sophisticated parsing
    if (file.mimetype === 'text/plain') {
      return file.buffer.toString('utf-8');
    }
    
    // For other file types, return filename as placeholder
    // In production, you'd implement proper PDF, DOC parsing
    return `Document: ${file.originalname}\nContent extraction not implemented for ${file.mimetype}`;
  }
}

export default new DocumentService();