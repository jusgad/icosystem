const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/upload', 
  authenticateToken, 
  documentController.upload.single('document'), 
  documentController.uploadDocument
);

router.get('/', authenticateToken, documentController.getDocuments);
router.get('/types', authenticateToken, documentController.getDocumentTypes);
router.get('/:id/download', authenticateToken, documentController.downloadDocument);
router.put('/:id', authenticateToken, documentController.updateDocument);
router.delete('/:id', authenticateToken, documentController.deleteDocument);

module.exports = router;