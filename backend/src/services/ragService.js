import { astraDB } from '../config/database.js';
import { aiService } from './aiService.js';
import { logger } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/helpers.js';

class RAGService {
  constructor() {
    this.collectionName = 'document_embeddings';
    this.chunkSize = 1000;
    this.chunkOverlap = 200;
  }

  // Chunk text into smaller pieces for better embedding
  chunkText(text, chunkSize = this.chunkSize, overlap = this.chunkOverlap) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
      
      start = end - overlap;
      if (start >= text.length) break;
    }

    return chunks.length > 0 ? chunks : [text];
  }

  // Store document chunks with embeddings
  async storeDocumentChunks(companyId, documentId, chunks, metadata = {}) {
    try {
      const collection = astraDB.collection(this.collectionName);
      let successCount = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          // Generate embeddings with fallback
          const embedding = await aiService.generateEmbeddings(chunk);
          
          const document = {
            _id: `${companyId}_${documentId}_${i}`,
            company_id: companyId,
            document_id: documentId,
            chunk_index: i,
            content: chunk,
            $vector: embedding,
            metadata: {
              ...metadata,
              chunk_count: chunks.length,
              created_at: new Date().toISOString()
            }
          };

          // Store with retry
          const insertOperation = async () => {
            const result = await collection.insertOne(document);
            if (!result.insertedId) {
              throw new Error('Failed to insert document chunk');
            }
            return result;
          };

          await retryWithBackoff(insertOperation, 3, 1000);
          successCount++;
          
        } catch (chunkError) {
          logger.error(`Error storing chunk ${i} for document ${documentId}:`, chunkError);
          // Continue with other chunks even if one fails
        }
      }

      if (successCount === 0) {
        throw new Error('Failed to store any document chunks');
      }

      logger.info(`Stored ${successCount}/${chunks.length} chunks for document ${documentId}`);
      return successCount;
    } catch (error) {
      logger.error('Error storing document chunks:', error);
      throw new Error('Failed to store document chunks');
    }
  }

  // Search for relevant context using vector similarity
  async searchRelevantContext(companyId, query, limit = 5) {
    try {
      const collection = astraDB.collection(this.collectionName);
      
      // Generate query embedding with fallback
      const queryEmbedding = await aiService.generateEmbeddings(query);
      
      // Search with retry
      const searchOperation = async () => {
        const results = await collection.find(
          {
            company_id: companyId
          },
          {
            vector: queryEmbedding,
            limit: limit,
            includeSimilarity: true
          }
        );

        return results.toArray();
      };

      const documents = await retryWithBackoff(searchOperation, 3, 1000);
      
      // Extract and combine relevant content
      const relevantContent = documents
        .filter(doc => doc.$similarity > 0.7) // Only include highly relevant content
        .map(doc => doc.content)
        .join('\n\n');

      return relevantContent;
    } catch (error) {
      logger.error('Error searching relevant context:', error);
      // Return empty string instead of throwing to allow chat to continue
      return '';
    }
  }

  // Generate RAG response with context
  async generateRAGResponse(companyId, query, conversationHistory = [], language = 'en') {
    try {
      // Search for relevant context
      const context = await this.searchRelevantContext(companyId, query);
      
      // Prepare messages for AI
      const messages = [
        ...conversationHistory,
        { role: 'user', content: query }
      ];

      // Get chatbot configuration to determine AI model
      let aiModel = 'gemini-1.5-flash'; // Default fallback model
      
      try {
        const { supabase } = await import('../config/database.js');
        const { data: chatbot } = await supabase
          .from('chatbots')
          .select('ai_model')
          .eq('company_id', companyId)
          .single();
        
        if (chatbot?.ai_model) {
          aiModel = chatbot.ai_model;
        }
      } catch (configError) {
        logger.warn('Could not fetch chatbot config, using default model:', configError.message);
      }

      // Generate response using AI service
      const response = await aiService.generateResponse(
        aiModel,
        messages,
        context,
        language
      );

      return {
        response: response.content,
        context_used: context.length > 0,
        context_length: context.length,
        model_used: aiModel
      };
    } catch (error) {
      logger.error('Error generating RAG response:', error);
      
      // Fallback to basic AI response without context
      try {
        const messages = [
          ...conversationHistory,
          { role: 'user', content: query }
        ];

        const response = await aiService.generateResponse(
          'gemini-1.5-flash',
          messages,
          '',
          language
        );

        return {
          response: response.content,
          context_used: false,
          context_length: 0,
          model_used: 'gemini-1.5-flash',
          fallback: true
        };
      } catch (fallbackError) {
        logger.error('Fallback response also failed:', fallbackError);
        throw new Error('Failed to generate response');
      }
    }
  }

  // Delete document chunks
  async deleteDocumentChunks(companyId, documentId) {
    try {
      const collection = astraDB.collection(this.collectionName);
      
      // Delete with retry
      const deleteOperation = async () => {
        const result = await collection.deleteMany({
          company_id: companyId,
          document_id: documentId
        });
        
        return result;
      };

      const result = await retryWithBackoff(deleteOperation, 3, 1000);
      logger.info(`Deleted ${result.deletedCount || 0} chunks for document ${documentId}`);
      
      return result.deletedCount || 0;
    } catch (error) {
      logger.error('Error deleting document chunks:', error);
      // Don't throw error to allow document deletion to continue
      return 0;
    }
  }

  // Get document statistics
  async getDocumentStats(companyId) {
    try {
      const collection = astraDB.collection(this.collectionName);
      
      // Count with retry
      const countOperation = async () => {
        const count = await collection.countDocuments({
          company_id: companyId
        });
        
        return count;
      };

      const totalChunks = await retryWithBackoff(countOperation, 3, 1000);
      
      return {
        total_chunks: totalChunks,
        collection_name: this.collectionName
      };
    } catch (error) {
      logger.error('Error getting document stats:', error);
      return {
        total_chunks: 0,
        collection_name: this.collectionName,
        error: error.message
      };
    }
  }

  // Test vector search functionality
  async testVectorSearch(companyId, testQuery = "test query") {
    try {
      const results = await this.searchRelevantContext(companyId, testQuery, 1);
      return {
        success: true,
        results_found: results.length > 0,
        context_length: results.length
      };
    } catch (error) {
      logger.error('Vector search test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const ragService = new RAGService();