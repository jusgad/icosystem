const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { messageValidation } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');

// Rate limiting para mensajería
router.post('/', rateLimiters.messaging, authenticateToken, messageValidation.send, messageController.sendMessage);
router.get('/conversations', authenticateToken, messageController.getConversations);
router.get('/unread-count', authenticateToken, messageController.getUnreadCount);
router.get('/search-users', authenticateToken, messageValidation.searchUsers, messageController.searchUsers);
router.get('/:userId', authenticateToken, messageController.getMessages);
router.put('/:messageId/read', authenticateToken, messageController.markAsRead);

module.exports = router;