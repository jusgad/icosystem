const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');
const { documentValidation, validateFileSize } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');

// Rate limiting para uploads
router.post('/upload',
  rateLimiters.upload,
  authenticateToken,
  documentController.upload.single('document'),
  validateFileSize(10485760), // 10MB
  documentValidation.upload,
  documentController.uploadDocument
);

router.get('/', authenticateToken, documentValidation.getDocuments, documentController.getDocuments);
router.get('/types', authenticateToken, documentController.getDocumentTypes);
router.get('/:id/download', authenticateToken, documentController.downloadDocument);
router.put('/:id', authenticateToken, documentValidation.update, documentController.updateDocument);
router.delete('/:id', authenticateToken, documentController.deleteDocument);

module.exports = router;