import { astraDB } from '../config/database.js';
import { aiService } from './aiService.js';
import { logger } from '../utils/logger.js';

export class RAGService {
  constructor() {
    this.collectionName = 'document_embeddings';
    this.chunkSize = 1000;
    this.chunkOverlap = 200;
  }

  // Store document chunks with embeddings
  async storeDocumentChunks(companyId, documentId, chunks, metadata = {}) {
    try {
      const collection = astraDB.collection(this.collectionName);
      const documents = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Generate embedding for the chunk
        const embedding = await aiService.generateEmbeddings(chunk);
        
        const document = {
          _id: `${documentId}_chunk_${i}`,
          content: chunk,
          $vector: embedding,
          company_id: companyId,
          document_id: documentId,
          chunk_index: i,
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
            chunk_size: chunk.length
          }
        };

        documents.push(document);
      }

      // Insert documents in batches
      const batchSize = 20;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await collection.insertMany(batch);
      }

      logger.info(`Stored ${documents.length} chunks for document ${documentId}`);
      return documents.length;
    } catch (error) {
      logger.error('Error storing document chunks:', error);
      throw new Error('Failed to store document chunks');
    }
  }

  // Search for relevant context using vector similarity
  async searchRelevantContext(companyId, query, limit = 5) {
    try {
      const collection = astraDB.collection(this.collectionName);
      
      // Generate embedding for the query
      const queryEmbedding = await aiService.generateEmbeddings(query);
      
      // Search for similar chunks
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

      // Extract and format relevant context
      const context = results
        .filter(result => result.$similarity > 0.7) // Filter by similarity threshold
        .map(result => ({
          content: result.content,
          similarity: result.$similarity,
          document_id: result.document_id,
          metadata: result.metadata
        }))
        .sort((a, b) => b.similarity - a.similarity);

      return context;
    } catch (error) {
      logger.error('Error searching relevant context:', error);
      throw new Error('Failed to search relevant context');
    }
  }

  // Generate response with RAG
  async generateRAGResponse(companyId, query, model, language = 'en', conversationHistory = []) {
    try {
      // Search for relevant context
      const relevantContext = await this.searchRelevantContext(companyId, query);
      
      // Build context string
      const contextString = relevantContext
        .map(ctx => ctx.content)
        .join('\n\n');

      // Prepare messages for AI
      const messages = [
        ...conversationHistory,
        { role: 'user', content: query }
      ];

      // Generate response using AI service
      const response = await aiService.generateResponse(
        model,
        messages,
        contextString,
        language
      );

      return {
        response: response.content,
        context_used: relevantContext,
        usage: response.usage,
        model_used: model,
        language: language
      };
    } catch (error) {
      logger.error('Error generating RAG response:', error);
      throw new Error('Failed to generate RAG response');
    }
  }

  // Delete document chunks
  async deleteDocumentChunks(companyId, documentId) {
    try {
      const collection = astraDB.collection(this.collectionName);
      
      const result = await collection.deleteMany({
        company_id: companyId,
        document_id: documentId
      });

      logger.info(`Deleted chunks for document ${documentId}`);
      return result;
    } catch (error) {
      logger.error('Error deleting document chunks:', error);
      throw new Error('Failed to delete document chunks');
    }
  }

  // Update document chunks
  async updateDocumentChunks(companyId, documentId, newChunks, metadata = {}) {
    try {
      // Delete existing chunks
      await this.deleteDocumentChunks(companyId, documentId);
      
      // Store new chunks
      return await this.storeDocumentChunks(companyId, documentId, newChunks, metadata);
    } catch (error) {
      logger.error('Error updating document chunks:', error);
      throw new Error('Failed to update document chunks');
    }
  }

  // Get document statistics
  async getDocumentStats(companyId, documentId = null) {
    try {
      const collection = astraDB.collection(this.collectionName);
      
      const filter = { company_id: companyId };
      if (documentId) {
        filter.document_id = documentId;
      }

      const results = await collection.find(filter, { limit: 1000 });
      
      const stats = {
        total_chunks: results.length,
        documents: {},
        total_content_length: 0
      };

      results.forEach(result => {
        const docId = result.document_id;
        if (!stats.documents[docId]) {
          stats.documents[docId] = {
            chunk_count: 0,
            content_length: 0,
            created_at: result.metadata.created_at
          };
        }
        stats.documents[docId].chunk_count++;
        stats.documents[docId].content_length += result.content.length;
        stats.total_content_length += result.content.length;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting document stats:', error);
      throw new Error('Failed to get document stats');
    }
  }

  // Chunk text into smaller pieces
  chunkText(text, chunkSize = this.chunkSize, overlap = this.chunkOverlap) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;
      
      // Try to break at sentence boundaries
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > start + chunkSize * 0.5) {
          end = breakPoint + 1;
        }
      }

      const chunk = text.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      start = end - overlap;
    }

    return chunks;
  }

  // Search similar documents across all companies (for analytics)
  async searchSimilarQueries(query, limit = 10) {
    try {
      const collection = astraDB.collection(this.collectionName);
      const queryEmbedding = await aiService.generateEmbeddings(query);
      
      const results = await collection.find(
        {},
        {
          vector: queryEmbedding,
          limit: limit,
          includeSimilarity: true
        }
      );

      return results.map(result => ({
        content: result.content,
        similarity: result.$similarity,
        company_id: result.company_id,
        document_id: result.document_id
      }));
    } catch (error) {
      logger.error('Error searching similar queries:', error);
      throw new Error('Failed to search similar queries');
    }
  }
}

export const ragService = new RAGService();