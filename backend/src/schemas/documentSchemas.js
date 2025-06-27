import Joi from 'joi';

export const documentSchemas = {
  uploadDocument: Joi.object({
    filename: Joi.string().required(),
    file_type: Joi.string().valid('pdf', 'docx', 'txt').required(),
    file_size: Joi.number().max(10485760).required() // 10MB max
  }),

  updateDocument: Joi.object({
    filename: Joi.string().optional(),
    status: Joi.string().valid('processing', 'processed', 'failed').optional()
  })
};