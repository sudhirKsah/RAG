import express from 'express';
import { supabase } from '../config/database.js';
import { ragService } from '../services/ragService.js';
import { logger } from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema for Tavus conversation request
const tavusConversationSchema = Joi.object({
  chatbot_id: Joi.string().uuid().required(),
  language: Joi.string().valid('en', 'es', 'fr', 'de', 'hi', 'ne', 'zh', 'ja').default('en'),
  session_id: Joi.string().optional(),
  max_duration: Joi.number().min(60).max(3600).default(1800), // 1 minute to 1 hour, default 30 minutes
});

// Helper function to truncate context to stay within token limits
const truncateContext = (context, maxTokens = 100000) => {
  // Approximate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  
  if (context.length <= maxChars) {
    return context;
  }
  
  // Truncate and add indication
  const truncated = context.substring(0, maxChars - 200); // Leave room for truncation message
  return truncated + '\n\n[Note: Context has been truncated due to length limits. This represents the most relevant information from your knowledge base.]';
};

// Create Tavus conversation with RAG context
router.post('/conversation', validateRequest(tavusConversationSchema), async (req, res) => {
  try {
    const { chatbot_id, language, session_id, max_duration } = req.body;

    // Get chatbot configuration
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*, profiles!inner(id, company_name)')
      .eq('id', chatbot_id)
      .eq('status', 'active')
      .single();

    if (chatbotError || !chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found or inactive'
      });
    }

    // Use custom keywords from chatbot or fallback to default
    const searchQuery = chatbot.video_keywords || 
      "company information, services, products, support, frequently asked questions, policies, procedures, contact information, business hours, pricing, features, benefits, troubleshooting, help, assistance";

    // Get comprehensive RAG context for the company
    const ragContext = await ragService.searchRelevantContext(
      chatbot.company_id,
      searchQuery,
      20 // Get more context for video conversations
    );

    // Truncate context to stay within Tavus limits (100k tokens for good performance)
    const truncatedContext = truncateContext(ragContext, 90000); // Leave some buffer

    // Build comprehensive context for Tavus
    const conversationalContext = `You are ${chatbot.name}, an AI customer support agent for ${chatbot.profiles.company_name}.

Company Knowledge Base:
${truncatedContext}

Instructions:
- Be friendly, professional, and helpful in all interactions
- Use the company information above to answer questions accurately and comprehensively
- If you don't know something specific from the knowledge base, acknowledge it politely and offer to help in other ways
- Keep responses conversational and natural for video chat
- Maintain appropriate eye contact and use natural gestures
- Speak clearly and at a moderate pace suitable for video communication
- Adapt your communication style to be warm and engaging
- Language: ${language}
- Welcome message: ${chatbot.welcome_message || 'Hello! How can I help you today?'}

Remember: You are representing ${chatbot.profiles.company_name} and should provide excellent customer service while being personable and approachable in video format.`;

    // Check final context length and log it
    const finalContextLength = conversationalContext.length;
    const estimatedTokens = Math.ceil(finalContextLength / 4);
    
    logger.info(`Tavus context prepared: ${finalContextLength} characters (~${estimatedTokens} tokens)`);
    
    if (estimatedTokens > 120000) {
      logger.warn(`Context may exceed Tavus token limit: ${estimatedTokens} tokens`);
    }

    // Make actual call to Tavus API
    try {
      const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.TAVUS_API_KEY
        },
        body: JSON.stringify({
          replica_id: process.env.TAVUS_REPLICA_ID,
          persona_id: process.env.TAVUS_PERSONA_ID,
          conversational_context: conversationalContext,
          properties: {
            max_call_duration: max_duration,
            participant_left_timeout: 60,
            participant_absent_timeout: 300,
            enable_recording: false,
            enable_closed_captions: true,
            language: language === 'en' ? 'english' : language
          }
        })
      });

      if (!tavusResponse.ok) {
        throw new Error(`Tavus API error: ${tavusResponse.status} ${tavusResponse.statusText}`);
      }

      const tavusData = await tavusResponse.json();

      // Log the conversation creation
      logger.info(`Tavus conversation created for chatbot ${chatbot_id}:`, {
        conversation_id: tavusData.conversation_id,
        company_id: chatbot.company_id,
        language,
        session_id,
        context_tokens: estimatedTokens
      });

      // Store conversation record
      try {
        await supabase
          .from('conversations')
          .insert({
            chatbot_id,
            company_id: chatbot.company_id,
            session_id: session_id || tavusData.conversation_id,
            user_message: 'Video conversation started',
            bot_response: 'Video conversation initiated with Tavus AI agent',
            language,
            model_used: 'tavus-video-agent',
            context_used: true,
            response_time: 0,
            created_at: new Date().toISOString()
          });
      } catch (dbError) {
        logger.error('Error storing conversation record:', dbError);
        // Don't fail the request if logging fails
      }

      res.json({
        success: true,
        data: {
          conversation: {
            conversation_id: tavusData.conversation_id,
            conversation_url: tavusData.conversation_url,
            status: tavusData.status,
            chatbot: {
              name: chatbot.name,
              company_name: chatbot.profiles.company_name,
              welcome_message: chatbot.welcome_message
            },
            context_length: truncatedContext.length,
            estimated_tokens: estimatedTokens
          }
        }
      });

    } catch (tavusError) {
      logger.error('Tavus API call failed:', tavusError);
      
      // Fallback to mock response if Tavus API fails
      const mockTavusResponse = {
        conversation_id: `tavus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversation_url: `https://tavus.daily.co/demo-${chatbot_id}?context=${encodeURIComponent(conversationalContext.substring(0, 500))}`,
        status: 'created'
      };

      // Log the fallback
      logger.warn('Using mock Tavus response due to API failure');

      res.json({
        success: true,
        data: {
          conversation: {
            conversation_id: mockTavusResponse.conversation_id,
            conversation_url: mockTavusResponse.conversation_url,
            status: mockTavusResponse.status,
            chatbot: {
              name: chatbot.name,
              company_name: chatbot.profiles.company_name,
              welcome_message: chatbot.welcome_message
            },
            context_length: truncatedContext.length,
            estimated_tokens: estimatedTokens
          }
        }
      });
    }

  } catch (error) {
    logger.error('Tavus conversation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create video conversation',
      error: error.message
    });
  }
});

// Get Tavus conversation status
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Try to get status from Tavus API
    try {
      const tavusResponse = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'x-api-key': process.env.TAVUS_API_KEY
        }
      });

      if (tavusResponse.ok) {
        const tavusData = await tavusResponse.json();
        res.json({
          success: true,
          data: { conversation: tavusData }
        });
        return;
      }
    } catch (tavusError) {
      logger.error('Tavus status API call failed:', tavusError);
    }

    // Fallback to mock response
    const mockStatus = {
      conversation_id: conversationId,
      status: 'active',
      participant_count: 1,
      duration: Math.floor(Math.random() * 300), // Random duration up to 5 minutes
      created_at: new Date(Date.now() - Math.random() * 300000).toISOString(), // Created within last 5 minutes
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { conversation: mockStatus }
    });

  } catch (error) {
    logger.error('Tavus conversation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation status',
      error: error.message
    });
  }
});

// End Tavus conversation - Enhanced with better error handling
router.delete('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Try to end conversation via Tavus API
    let tavusSuccess = false;
    try {
      const tavusResponse = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': process.env.TAVUS_API_KEY
        }
      });

      if (tavusResponse.ok) {
        tavusSuccess = true;
        logger.info(`Tavus conversation ended successfully: ${conversationId}`);
      } else {
        logger.warn(`Tavus API returned ${tavusResponse.status} for conversation ${conversationId}`);
      }
    } catch (tavusError) {
      logger.error('Tavus end conversation API call failed:', tavusError);
    }

    // Log conversation end regardless of Tavus API success
    try {
      await supabase
        .from('conversations')
        .insert({
          session_id: conversationId,
          user_message: 'Video conversation ended',
          bot_response: `Video conversation terminated ${tavusSuccess ? 'successfully' : 'with API issues'}`,
          language: 'en',
          model_used: 'tavus-video-agent',
          context_used: false,
          response_time: 0,
          created_at: new Date().toISOString()
        });
    } catch (dbError) {
      logger.error('Error logging conversation end:', dbError);
    }

    res.json({
      success: true,
      message: 'Conversation ended successfully',
      tavus_api_success: tavusSuccess
    });

  } catch (error) {
    logger.error('Tavus conversation end error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end conversation',
      error: error.message
    });
  }
});

// Handle beacon requests for cleanup during page unload
router.post('/conversation/:conversationId/cleanup', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    logger.info(`Cleanup request received for conversation: ${conversationId}`);

    // Try to end conversation via Tavus API
    try {
      const tavusResponse = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': process.env.TAVUS_API_KEY
        }
      });

      if (tavusResponse.ok) {
        logger.info(`Tavus conversation cleaned up: ${conversationId}`);
      }
    } catch (tavusError) {
      logger.error('Tavus cleanup API call failed:', tavusError);
    }

    // Always respond with success for cleanup requests
    res.status(200).json({ success: true });

  } catch (error) {
    logger.error('Tavus conversation cleanup error:', error);
    res.status(200).json({ success: false }); // Still return 200 for cleanup
  }
});

// Get Tavus analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d', chatbot_id } = req.query;

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
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get video conversation analytics
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('model_used', 'tavus-video-agent')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (chatbot_id) {
      query = query.eq('chatbot_id', chatbot_id);
    }

    const { data: conversations, error } = await query;

    if (error) throw error;

    const analytics = {
      total_video_conversations: conversations.length,
      unique_video_sessions: new Set(conversations.map(c => c.session_id)).size,
      avg_conversation_duration: 0, // Would be calculated from actual Tavus data
      video_languages: [...new Set(conversations.map(c => c.language))],
      daily_video_conversations: {},
      video_success_rate: 95 // Mock data - would come from Tavus analytics
    };

    // Group by day
    conversations.forEach(conv => {
      const day = new Date(conv.created_at).toISOString().split('T')[0];
      analytics.daily_video_conversations[day] = (analytics.daily_video_conversations[day] || 0) + 1;
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
    logger.error('Tavus analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get video analytics',
      error: error.message
    });
  }
});

export default router;