import express from 'express';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get overall analytics for the company
router.get('/overview', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const companyId = req.user.id;

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

    // Get all conversations for the company
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*, chatbots!inner(company_id)')
      .eq('chatbots.company_id', companyId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (convError) throw convError;

    // Get chatbots count
    const { data: chatbots, error: chatbotsError } = await supabase
      .from('chatbots')
      .select('id, status')
      .eq('company_id', companyId);

    if (chatbotsError) throw chatbotsError;

    // Get documents count
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, status')
      .eq('company_id', companyId);

    if (docsError) throw docsError;

    // Calculate analytics
    const analytics = {
      overview: {
        total_conversations: conversations.length,
        unique_sessions: new Set(conversations.map(c => c.session_id)).size,
        active_chatbots: chatbots.filter(c => c.status === 'active').length,
        total_chatbots: chatbots.length,
        processed_documents: documents.filter(d => d.status === 'processed').length,
        total_documents: documents.length,
        avg_response_time: conversations.reduce((sum, c) => sum + (c.response_time || 0), 0) / conversations.length || 0
      },
      trends: {
        conversations_by_day: {},
        languages_distribution: {},
        model_usage: {},
        hourly_distribution: {}
      },
      performance: {
        response_times: [],
        success_rate: 0,
        user_satisfaction: 0
      }
    };

    // Process conversations for trends
    conversations.forEach(conv => {
      const date = new Date(conv.created_at);
      const day = date.toISOString().split('T')[0];
      const hour = date.getHours();

      // Daily trends
      analytics.trends.conversations_by_day[day] = (analytics.trends.conversations_by_day[day] || 0) + 1;
      
      // Language distribution
      analytics.trends.languages_distribution[conv.language] = (analytics.trends.languages_distribution[conv.language] || 0) + 1;
      
      // Model usage
      analytics.trends.model_usage[conv.model_used] = (analytics.trends.model_usage[conv.model_used] || 0) + 1;
      
      // Hourly distribution
      analytics.trends.hourly_distribution[hour] = (analytics.trends.hourly_distribution[hour] || 0) + 1;
      
      // Response times
      if (conv.response_time) {
        analytics.performance.response_times.push(conv.response_time);
      }
    });

    // Calculate success rate (conversations with context used)
    const successfulConversations = conversations.filter(c => c.context_used).length;
    analytics.performance.success_rate = conversations.length > 0 ? (successfulConversations / conversations.length) * 100 : 0;

    // Get user satisfaction from feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('conversation_feedback')
      .select('rating')
      .in('conversation_id', conversations.map(c => c.id));

    if (!feedbackError && feedback.length > 0) {
      const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
      analytics.performance.user_satisfaction = (avgRating / 5) * 100; // Convert to percentage
    }

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
    logger.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics overview',
      error: error.message
    });
  }
});

// Get conversation analytics
router.get('/conversations', async (req, res) => {
  try {
    const { period = '7d', chatbot_id } = req.query;
    const companyId = req.user.id;

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

    let query = supabase
      .from('conversations')
      .select('*, chatbots!inner(company_id, name)')
      .eq('chatbots.company_id', companyId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (chatbot_id) {
      query = query.eq('chatbot_id', chatbot_id);
    }

    const { data: conversations, error } = await query;

    if (error) throw error;

    // Analyze conversations
    const analytics = {
      total_conversations: conversations.length,
      unique_sessions: new Set(conversations.map(c => c.session_id)).size,
      avg_conversation_length: 0,
      top_questions: {},
      response_time_distribution: {
        '0-1s': 0,
        '1-2s': 0,
        '2-3s': 0,
        '3-5s': 0,
        '5s+': 0
      },
      language_breakdown: {},
      chatbot_breakdown: {}
    };

    // Process conversations
    const sessionConversations = {};
    conversations.forEach(conv => {
      // Group by session for conversation length
      if (!sessionConversations[conv.session_id]) {
        sessionConversations[conv.session_id] = [];
      }
      sessionConversations[conv.session_id].push(conv);

      // Top questions (simplified - using first few words)
      const question = conv.user_message.split(' ').slice(0, 5).join(' ');
      analytics.top_questions[question] = (analytics.top_questions[question] || 0) + 1;

      // Response time distribution
      const responseTime = conv.response_time || 0;
      if (responseTime < 1000) analytics.response_time_distribution['0-1s']++;
      else if (responseTime < 2000) analytics.response_time_distribution['1-2s']++;
      else if (responseTime < 3000) analytics.response_time_distribution['2-3s']++;
      else if (responseTime < 5000) analytics.response_time_distribution['3-5s']++;
      else analytics.response_time_distribution['5s+']++;

      // Language breakdown
      analytics.language_breakdown[conv.language] = (analytics.language_breakdown[conv.language] || 0) + 1;

      // Chatbot breakdown
      const chatbotName = conv.chatbots.name;
      analytics.chatbot_breakdown[chatbotName] = (analytics.chatbot_breakdown[chatbotName] || 0) + 1;
    });

    // Calculate average conversation length
    const sessionLengths = Object.values(sessionConversations).map(session => session.length);
    analytics.avg_conversation_length = sessionLengths.length > 0 
      ? sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length 
      : 0;

    // Sort top questions
    analytics.top_questions = Object.entries(analytics.top_questions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    res.json({
      success: true,
      data: {
        analytics,
        period,
        chatbot_id: chatbot_id || 'all'
      }
    });
  } catch (error) {
    logger.error('Get conversation analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation analytics',
      error: error.message
    });
  }
});

// Get real-time analytics
router.get('/realtime', async (req, res) => {
  try {
    const companyId = req.user.id;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get recent conversations
    const { data: recentConversations, error } = await supabase
      .from('conversations')
      .select('*, chatbots!inner(company_id, name)')
      .eq('chatbots.company_id', companyId)
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Get active sessions (sessions with activity in last 10 minutes)
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const activeSessions = new Set(
      recentConversations
        .filter(conv => new Date(conv.created_at) > tenMinutesAgo)
        .map(conv => conv.session_id)
    );

    const analytics = {
      active_sessions: activeSessions.size,
      conversations_last_hour: recentConversations.length,
      avg_response_time_last_hour: recentConversations.reduce((sum, c) => sum + (c.response_time || 0), 0) / recentConversations.length || 0,
      recent_activity: recentConversations.slice(0, 10).map(conv => ({
        id: conv.id,
        chatbot_name: conv.chatbots.name,
        user_message: conv.user_message.substring(0, 100) + (conv.user_message.length > 100 ? '...' : ''),
        language: conv.language,
        created_at: conv.created_at,
        response_time: conv.response_time
      })),
      languages_active: [...new Set(recentConversations.map(c => c.language))],
      chatbots_active: [...new Set(recentConversations.map(c => c.chatbots.name))]
    };

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Get realtime analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get realtime analytics',
      error: error.message
    });
  }
});

// Export analytics data
router.get('/export', async (req, res) => {
  try {
    const { period = '30d', format = 'json' } = req.query;
    const companyId = req.user.id;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period.replace('d', '')));

    // Get all data for export
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, chatbots!inner(company_id, name)')
      .eq('chatbots.company_id', companyId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const exportData = {
      export_info: {
        company_id: companyId,
        period,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        total_records: conversations.length,
        exported_at: new Date().toISOString()
      },
      conversations: conversations.map(conv => ({
        id: conv.id,
        chatbot_name: conv.chatbots.name,
        session_id: conv.session_id,
        user_message: conv.user_message,
        bot_response: conv.bot_response,
        language: conv.language,
        model_used: conv.model_used,
        context_used: conv.context_used,
        response_time: conv.response_time,
        created_at: conv.created_at
      }))
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = [
        'ID,Chatbot Name,Session ID,User Message,Bot Response,Language,Model Used,Context Used,Response Time,Created At',
        ...exportData.conversations.map(conv => 
          `"${conv.id}","${conv.chatbot_name}","${conv.session_id}","${conv.user_message.replace(/"/g, '""')}","${conv.bot_response.replace(/"/g, '""')}","${conv.language}","${conv.model_used}","${conv.context_used}","${conv.response_time}","${conv.created_at}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}.json"`);
      res.json(exportData);
    }

    logger.info(`Analytics exported for company: ${companyId}, period: ${period}, format: ${format}`);
  } catch (error) {
    logger.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: error.message
    });
  }
});

export default router;