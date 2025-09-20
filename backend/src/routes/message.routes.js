const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Send a new message
router.post('/send', messageController.sendMessage);

// Get conversation with another user
router.get('/conversation/:otherUserId', messageController.getConversation);

// Get all conversations for current user
router.get('/conversations', messageController.getConversations);

// Mark message as read
router.patch('/:messageId/read', messageController.markAsRead);

// Delete message
router.delete('/:messageId', messageController.deleteMessage);

// Reply to a message
router.post('/:messageId/reply', messageController.replyToMessage);

// Get unread message count
router.get('/unread-count', messageController.getUnreadCount);

// Get available contacts for messaging
router.get('/available-contacts', messageController.getAvailableContacts);

module.exports = router;