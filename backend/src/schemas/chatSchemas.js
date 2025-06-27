import Joi from 'joi';

export const chatSchemas = {
  chatMessage: Joi.object({
    message: Joi.string().min(1).max(2000).required().messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 2000 characters',
      'any.required': 'Message is required'
    }),
    language: Joi.string().valid('en', 'es', 'fr', 'de', 'hi', 'ne', 'zh', 'ja').default('en'),
    session_id: Joi.string().optional(),
    conversation_history: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required()
      })
    ).max(20).optional() // Limit conversation history to last 20 messages
  }),

  feedback: Joi.object({
    conversation_id: Joi.string().uuid().required().messages({
      'string.uuid': 'Invalid conversation ID',
      'any.required': 'Conversation ID is required'
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required'
    }),
    comment: Joi.string().max(1000).optional().messages({
      'string.max': 'Comment cannot exceed 1000 characters'
    })
  })
};