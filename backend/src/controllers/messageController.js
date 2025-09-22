const { Message, User } = require('../models');
const { Op } = require('sequelize');

class MessageController {
  async sendMessage(req, res) {
    try {
      const { receiverId, content, messageType = 'text', attachments = [] } = req.body;
      const senderId = req.user.id;

      if (!receiverId || !content) {
        return res.status(400).json({ error: 'Receiver and content are required' });
      }

      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      const message = await Message.create({
        senderId,
        receiverId,
        content,
        messageType,
        attachments
      });

      const messageWithUsers = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'profilePicture'] },
          { model: User, as: 'receiver', attributes: ['id', 'name', 'profilePicture'] }
        ]
      });

      res.status(201).json({
        message: 'Message sent successfully',
        data: messageWithUsers
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  async getConversations(req, res) {
    try {
      const userId = req.user.id;

      const conversations = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'profilePicture'] },
          { model: User, as: 'receiver', attributes: ['id', 'name', 'profilePicture'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 100
      });

      const conversationMap = new Map();

      conversations.forEach(message => {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        const otherUser = message.senderId === userId ? message.receiver : message.sender;

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            user: otherUser,
            lastMessage: message,
            unreadCount: 0
          });
        }

        if (message.receiverId === userId && !message.isRead) {
          conversationMap.get(otherUserId).unreadCount++;
        }
      });

      const conversationsList = Array.from(conversationMap.values());

      res.json({ conversations: conversationsList });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  }

  async getMessages(req, res) {
    try {
      const { userId: otherUserId } = req.params;
      const currentUserId = req.user.id;
      const { page = 1, limit = 50 } = req.query;

      const offset = (page - 1) * limit;

      const messages = await Message.findAndCountAll({
        where: {
          [Op.or]: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId }
          ]
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'profilePicture'] },
          { model: User, as: 'receiver', attributes: ['id', 'name', 'profilePicture'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      await Message.update(
        { isRead: true },
        {
          where: {
            senderId: otherUserId,
            receiverId: currentUserId,
            isRead: false
          }
        }
      );

      res.json({
        messages: messages.rows.reverse(),
        pagination: {
          total: messages.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(messages.count / limit)
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  }

  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await Message.findOne({
        where: {
          id: messageId,
          receiverId: userId
        }
      });

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      await message.update({ isRead: true });

      res.json({ message: 'Message marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const unreadCount = await Message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      });

      res.json({ unreadCount });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }

  async searchUsers(req, res) {
    try {
      const { query } = req.query;
      const currentUserId = req.user.id;

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const users = await User.findAll({
        where: {
          id: { [Op.ne]: currentUserId },
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } }
          ],
          isActive: true
        },
        attributes: ['id', 'name', 'email', 'profilePicture', 'role'],
        limit: 10
      });

      res.json({ users });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  }
}

module.exports = new MessageController();