const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, messageController.sendMessage);
router.get('/conversations', authenticateToken, messageController.getConversations);
router.get('/unread-count', authenticateToken, messageController.getUnreadCount);
router.get('/search-users', authenticateToken, messageController.searchUsers);
router.get('/:userId', authenticateToken, messageController.getMessages);
router.put('/:messageId/read', authenticateToken, messageController.markAsRead);

module.exports = router;