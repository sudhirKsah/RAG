import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';
import { chatbotSchemas } from '../schemas/chatbotSchemas.js';

const router = express.Router();

// Create new chatbot
router.post('/', validateRequest(chatbotSchemas.createChatbot), async (req, res) => {
  try {
    const {
      name,
      description,
      ai_model = 'gpt-3.5-turbo',
      welcome_message,
      primary_color = '#2563eb',
      supported_languages = ['en'],
      logo_url
    } = req.body;

    const chatbotId = uuidv4();

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .insert([{
        id: chatbotId,
        company_id: req.user.id,
        name,
        description,
        ai_model,
        welcome_message,
        primary_color,
        supported_languages,
        logo_url,
        status: 'active',
        public_url: `${process.env.FRONTEND_URL}/chat/${chatbotId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    logger.info(`Chatbot created: ${chatbotId}`);

    res.status(201).json({
      success: true,
      message: 'Chatbot created successfully',
      data: { chatbot }
    });
  } catch (error) {
    logger.error('Create chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chatbot',
      error: error.message
    });
  }
});

// Get all chatbots for the company
router.get('/', async (req, res) => {
  try {
    const { data: chatbots, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('company_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { chatbots }
    });
  } catch (error) {
    logger.error('Get chatbots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbots',
      error: error.message
    });
  }
});

// Get chatbot by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.id)
      .single();

    if (error || !chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    res.json({
      success: true,
      data: { chatbot }
    });
  } catch (error) {
    logger.error('Get chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot',
      error: error.message
    });
  }
});

// Update chatbot
router.put('/:id', validateRequest(chatbotSchemas.updateChatbot), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    logger.info(`Chatbot updated: ${id}`);

    res.json({
      success: true,
      message: 'Chatbot updated successfully',
      data: { chatbot }
    });
  } catch (error) {
    logger.error('Update chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chatbot',
      error: error.message
    });
  }
});

// Delete chatbot
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related conversations first
    await supabase
      .from('conversations')
      .delete()
      .eq('chatbot_id', id);

    // Delete chatbot
    const { error } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', id)
      .eq('company_id', req.user.id);

    if (error) throw error;

    logger.info(`Chatbot deleted: ${id}`);

    res.json({
      success: true,
      message: 'Chatbot deleted successfully'
    });
  } catch (error) {
    logger.error('Delete chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chatbot',
      error: error.message
    });
  }
});

// Toggle chatbot status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('company_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    logger.info(`Chatbot status changed: ${id} -> ${status}`);

    res.json({
      success: true,
      message: `Chatbot ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: { chatbot }
    });
  } catch (error) {
    logger.error('Toggle chatbot status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chatbot status',
      error: error.message
    });
  }
});

// Get chatbot analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '7d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get conversation statistics
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('chatbot_id', id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Calculate analytics
    const analytics = {
      total_conversations: conversations.length,
      unique_sessions: new Set(conversations.map(c => c.session_id)).size,
      languages_used: [...new Set(conversations.map(c => c.language))],
      avg_response_time: conversations.reduce((sum, c) => sum + (c.response_time || 0), 0) / conversations.length || 0,
      conversations_by_day: {},
      languages_distribution: {},
      model_usage: {}
    };

    // Group by day
    conversations.forEach(conv => {
      const day = new Date(conv.created_at).toISOString().split('T')[0];
      analytics.conversations_by_day[day] = (analytics.conversations_by_day[day] || 0) + 1;
      
      // Language distribution
      analytics.languages_distribution[conv.language] = (analytics.languages_distribution[conv.language] || 0) + 1;
      
      // Model usage
      analytics.model_usage[conv.model_used] = (analytics.model_usage[conv.model_used] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        analytics,
        period,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }
    });
  } catch (error) {
    logger.error('Get chatbot analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot analytics',
      error: error.message
    });
  }
});

// Generate API key for chatbot
router.post('/:id/api-key', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate new API key
    const apiKey = `cb_${uuidv4().replace(/-/g, '')}`;
    
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .update({
        api_key: apiKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('company_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    logger.info(`API key generated for chatbot: ${id}`);

    res.json({
      success: true,
      message: 'API key generated successfully',
      data: {
        api_key: apiKey,
        chatbot_id: id
      }
    });
  } catch (error) {
    logger.error('Generate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key',
      error: error.message
    });
  }
});

export default router;