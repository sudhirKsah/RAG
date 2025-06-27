import { createClient } from '@supabase/supabase-js';
import { DataAPIClient } from '@datastax/astra-db-ts';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Astra DB client
const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
export const astraDB = client.db(process.env.ASTRA_DB_API_ENDPOINT);

// export const astraDB = new DataAPIClient({
//   token: process.env.ASTRA_DB_APPLICATION_TOKEN,
//   endpoint: process.env.ASTRA_DB_API_ENDPOINT,
//   namespace: process.env.ASTRA_DB_NAMESPACE || 'chatbot_vectors'
// });

export const initializeDatabase = async () => {
  try {
    // Test Supabase
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    logger.info('✅ Supabase connected successfully');

    // Test Astra DB
    const collections = await astraDB.listCollections();
    logger.info('✅ Astra DB connected successfully', collections);
    logger.info(`📊 Available collections: ${collections.length}`);

    // Ensure default vector collection exists
    const collectionName = 'document_embeddings';
    const exists = collections.some(c => c.name === collectionName);

    if (!exists) {
      await astraDB.createCollection(collectionName, {
        vector: {
          dimension: 1536,
          metric: 'cosine'
        }
      });
      logger.info(`📁 Created collection: ${collectionName}`);
    } else {
      logger.info(`📁 Collection ${collectionName} already exists`);
    }

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Run on load
initializeDatabase().catch(error => {
  logger.error('Failed to initialize database:', error);
  process.exit(1);
});
