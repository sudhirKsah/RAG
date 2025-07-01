import Joi from 'joi';

export const chatbotSchemas = {
  createChatbot: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Chatbot name must be at least 2 characters long',
      'string.max': 'Chatbot name cannot exceed 100 characters',
      'any.required': 'Chatbot name is required'
    }),
    description: Joi.string().max(500).optional().allow(''),
    ai_model: Joi.string().valid('gpt-4', 'gpt-3.5-turbo', 'gemini-pro', 'gemini-1.5-flash', 'gemini-2.0-flash').default('gpt-3.5-turbo'),
    welcome_message: Joi.string().max(500).optional().allow(''),
    primary_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#2563eb').messages({
      'string.pattern.base': 'Primary color must be a valid hex color code'
    }),
    supported_languages: Joi.array().items(
      Joi.string().valid('en', 'es', 'fr', 'de', 'hi', 'ne', 'zh', 'ja')
    ).min(1).default(['en']),
    logo_url: Joi.string().uri().optional().allow('', null),
    video_keywords: Joi.string().max(2000).optional().allow('').messages({
      'string.max': 'Video keywords cannot exceed 2000 characters'
    })
  }),

  updateChatbot: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional().allow(''),
    ai_model: Joi.string().valid('gpt-4', 'gpt-3.5-turbo', 'gemini-pro', 'gemini-1.5-flash', 'gemini-2.0-flash').optional(),
    welcome_message: Joi.string().max(500).optional().allow(''),
    primary_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    supported_languages: Joi.array().items(
      Joi.string().valid('en', 'es', 'fr', 'de', 'hi', 'ne', 'zh', 'ja')
    ).min(1).optional(),
    logo_url: Joi.string().uri().optional().allow('', null),
    status: Joi.string().valid('active', 'inactive').optional(),
    video_keywords: Joi.string().max(2000).optional().allow('').messages({
      'string.max': 'Video keywords cannot exceed 2000 characters'
    })
  })
};