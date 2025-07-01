import express from 'express';
import multer from 'multer';
import { documentService } from '../services/documentService.js';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';
import { documentSchemas } from '../schemas/documentSchemas.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Upload and process document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await documentService.processDocument(
      req.file,
      req.user.id, // company_id (using user id as company id for now)
      req.user.id
    );

    logger.info(`Document uploaded successfully: ${result.id}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Document upload failed',
      error: error.message
    });
  }
});

// Get all documents for the company
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const documents = await documentService.getDocuments(
      req.user.id,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: documents.length
        }
      }
    });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents',
      error: error.message
    });
  }
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.id)
      .single();

    if (error || !document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document',
      error: error.message
    });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await documentService.deleteDocument(id, req.user.id);

    logger.info(`Document deleted: ${id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// Reprocess document
router.post('/:id/reprocess', async (req, res) => {
  try {
    const { id } = req.params;
    
    await documentService.reprocessDocument(id, req.user.id);

    logger.info(`Document reprocessed: ${id}`);

    res.json({
      success: true,
      message: 'Document reprocessed successfully'
    });
  } catch (error) {
    logger.error('Reprocess document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reprocess document',
      error: error.message
    });
  }
});

// Get document statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await documentService.getDocumentStats(req.user.id);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document statistics',
      error: error.message
    });
  }
});

// Bulk upload documents
router.post('/bulk-upload', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const result = await documentService.processDocument(
          file,
          req.user.id,
          req.user.id
        );
        results.push(result);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    logger.info(`Bulk upload completed: ${results.length} successful, ${errors.length} failed`);

    res.status(201).json({
      success: true,
      message: `Bulk upload completed: ${results.length} successful, ${errors.length} failed`,
      data: {
        successful: results,
        failed: errors
      }
    });
  } catch (error) {
    logger.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk upload failed',
      error: error.message
    });
  }
});

export default router;