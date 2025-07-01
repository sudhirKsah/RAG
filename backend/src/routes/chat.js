import express from 'express';
import { ragService } from '../services/ragService.js';
import { aiService } from '../services/aiService.js';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';
import { chatSchemas } from '../schemas/chatSchemas.js';

const router = express.Router();

// Public chat endpoint for deployed chatbots
router.post('/:chatbotId', validateRequest(chatSchemas.chatMessage), async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { message, language = 'en', session_id, conversation_history = [] } = req.body;

    // Get chatbot configuration
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('*, profiles!inner(id, company_name)')
      .eq('id', chatbotId)
      .eq('status', 'active')
      .single();

    if (error || !chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found or inactive'
      });
    }

    // Generate RAG response with fallback handling
    let response;
    try {
      response = await ragService.generateRAGResponse(
        chatbot.company_id,
        message,
        chatbot.ai_model,
        language,
        conversation_history
      );
    } catch (error) {
      logger.error('RAG service error, falling back to Gemini 2.0 Flash:', error);
      
      // Fallback to Gemini 2.0 Flash
      response = await ragService.generateRAGResponse(
        chatbot.company_id,
        message,
        'gemini-2.0-flash',
        language,
        conversation_history
      );
    }

    // Log conversation
    await logConversation({
      chatbot_id: chatbotId,
      company_id: chatbot.company_id,
      session_id,
      user_message: message,
      bot_response: response.response,
      language,
      model_used: response.model_used,
      context_used: response.context_used.length > 0,
      response_time: Date.now() - req.startTime
    });

    // Emit real-time update if socket is available
    const io = req.app.get('io');
    if (io) {
      io.to(`chatbot-${chatbotId}`).emit('new-message', {
        session_id,
        message,
        response: response.response,
        language
      });
    }

    res.json({
      success: true,
      data: {
        response: response.response,
        language,
        model_used: response.model_used,
        session_id,
        chatbot: {
          name: chatbot.name,
          company_name: chatbot.profiles.company_name,
          welcome_message: chatbot.welcome_message
        }
      }
    });
  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
});

// Stream chat response
router.post('/:chatbotId/stream', validateRequest(chatSchemas.chatMessage), async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { message, language = 'en', session_id, conversation_history = [] } = req.body;

    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Get chatbot configuration
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .eq('status', 'active')
      .single();

    if (error || !chatbot) {
      res.write(`data: ${JSON.stringify({ error: 'Chatbot not found' })}\n\n`);
      res.end();
      return;
    }

    // Get relevant context
    const relevantContext = await ragService.searchRelevantContext(
      chatbot.company_id,
      message
    );

    const contextString = relevantContext
      .map(ctx => ctx.content)
      .join('\n\n');

    // Prepare messages
    const messages = [
      ...conversation_history,
      { role: 'user', content: message }
    ];

    // Generate streaming response with fallback
    let stream;
    let modelUsed = chatbot.ai_model;
    
    try {
      stream = await aiService.generateStreamResponse(
        chatbot.ai_model,
        messages,
        contextString,
        language
      );
    } catch (error) {
      logger.error('Primary model failed, falling back to Gemini 2.0 Flash:', error);
      
      // Fallback to Gemini 2.0 Flash
      modelUsed = 'gemini-2.0-flash';
      stream = await aiService.generateStreamResponse(
        'gemini-2.0-flash',
        messages,
        contextString,
        language
      );
    }

    let fullResponse = '';

    if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
      // Handle streaming response
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
          }
        }
      } catch (streamError) {
        logger.error('Streaming error:', streamError);
        res.write(`data: ${JSON.stringify({ error: 'Streaming interrupted' })}\n\n`);
      }
    } else {
      // Handle non-streaming response
      fullResponse = stream.response || stream.content || '';
      res.write(`data: ${JSON.stringify({ content: fullResponse, done: false })}\n\n`);
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);

    // Log conversation
    await logConversation({
      chatbot_id: chatbotId,
      company_id: chatbot.company_id,
      session_id,
      user_message: message,
      bot_response: fullResponse,
      language,
      model_used: modelUsed,
      context_used: relevantContext.length > 0,
      response_time: Date.now() - req.startTime
    });

    res.end();
  } catch (error) {
    logger.error('Stream chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`);
    res.end();
  }
});

// Get conversation history
router.get('/:chatbotId/conversations/:sessionId', async (req, res) => {
  try {
    const { chatbotId, sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: conversations.length
        }
      }
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
});

// Submit feedback for a conversation
router.post('/feedback', validateRequest(chatSchemas.feedback), async (req, res) => {
  try {
    const { conversation_id, rating, comment } = req.body;

    const { data: feedback, error } = await supabase
      .from('conversation_feedback')
      .insert([{
        conversation_id,
        rating,
        comment,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    logger.info(`Feedback submitted for conversation: ${conversation_id}`);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback }
    });
  } catch (error) {
    logger.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// Get chatbot status
router.get('/:chatbotId/status', async (req, res) => {
  try {
    const { chatbotId } = req.params;

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('id, name, status, created_at, updated_at')
      .eq('id', chatbotId)
      .single();

    if (error || !chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    res.json({
      success: true,
      data: {
        chatbot,
        status: chatbot.status,
        uptime: Date.now() - new Date(chatbot.created_at).getTime()
      }
    });
  } catch (error) {
    logger.error('Get chatbot status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot status',
      error: error.message
    });
  }
});

// Helper function to log conversations
async function logConversation(data) {
  try {
    await supabase
      .from('conversations')
      .insert([{
        ...data,
        created_at: new Date().toISOString()
      }]);
  } catch (error) {
    logger.error('Error logging conversation:', error);
  }
}

export default router;