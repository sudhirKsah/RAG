import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, company_name')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Add user to request object
    req.user = user;
    req.startTime = Date.now(); // For response time tracking
    
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Optional auth middleware for public endpoints that can work with or without auth
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { data: user, error } = await supabase
        .from('profiles')
        .select('id, email, company_name')
        .eq('id', decoded.userId)
        .single();

      if (!error && user) {
        req.user = user;
      }
    }
    
    req.startTime = Date.now();
    next();
  } catch (error) {
    // Continue without auth for optional auth middleware
    req.startTime = Date.now();
    next();
  }
};

// API key authentication for chatbot endpoints
export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    // Verify API key
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('id, company_id, status')
      .eq('api_key', apiKey)
      .single();

    if (error || !chatbot) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    if (chatbot.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Chatbot is not active'
      });
    }

    req.chatbot = chatbot;
    req.startTime = Date.now();
    
    next();
  } catch (error) {
    logger.error('API key auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};