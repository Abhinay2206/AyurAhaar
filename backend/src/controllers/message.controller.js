const Message = require('../models/Message');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');

const messageController = {
  // Send a new message
  sendMessage: async (req, res) => {
    try {
      const { receiverId, content, messageType = 'text', subject, priority = 'normal', relatedAppointment } = req.body;
      const senderId = req.user.userId;
      const senderType = req.user.role;

      // Validate required fields
      if (!receiverId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Receiver ID and content are required'
        });
      }

      // Determine receiver type
      const receiverTypeMap = {
        doctor: 'patient',
        patient: 'doctor'
      };
      const receiverType = receiverTypeMap[senderType];

      // Validate doctor-patient relationship
      let doctorId, patientId;
      if (senderType === 'doctor') {
        doctorId = senderId;
        patientId = receiverId;
      } else {
        doctorId = receiverId;
        patientId = senderId;
      }

      console.log(`Validating relationship: Doctor ${doctorId}, Patient ${patientId}`);
      
      const hasRelationship = await Message.validateDoctorPatientRelationship(doctorId, patientId);
      console.log(`Relationship validation result: ${hasRelationship}`);
      
      if (!hasRelationship) {
        return res.status(403).json({
          success: false,
          message: 'You can only message doctors/patients you have appointments with. Please book an appointment first.',
          details: 'No appointment history found between this doctor and patient'
        });
      }

      // Create conversation ID
      const conversationId = Message.createConversationId(senderId, receiverId);

      // Create message
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        senderType,
        receiverType,
        content,
        messageType,
        subject,
        priority,
        conversationId,
        relatedAppointment
      });

      await message.save();

      // Populate sender and receiver details
      await message.populate([
        { path: 'sender', select: 'name email userType' },
        { path: 'receiver', select: 'name email userType' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  },

  // Get conversation between two users
  getConversation: async (req, res) => {
    try {
      const { otherUserId } = req.params;
      const userId = req.user.userId;
      const { page = 1, limit = 50 } = req.query;

      // Validate doctor-patient relationship
      const userType = req.user.role;
      let doctorId, patientId;
      
      if (userType === 'doctor') {
        doctorId = userId;
        patientId = otherUserId;
      } else {
        doctorId = otherUserId;
        patientId = userId;
      }

      const hasRelationship = await Message.validateDoctorPatientRelationship(doctorId, patientId);
      if (!hasRelationship) {
        return res.status(403).json({
          success: false,
          message: 'You can only view conversations with doctors/patients you have appointments with'
        });
      }

      const conversationId = Message.createConversationId(userId, otherUserId);

      const messages = await Message.find({
        conversationId,
        isDeleted: false,
        $nor: [
          { deletedBy: { $elemMatch: { user: userId } } }
        ]
      })
      .populate('sender', 'name email userType')
      .populate('receiver', 'name email userType')
      .populate('replyTo', 'content sender createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Mark messages as read for the current user
      await Message.updateMany(
        {
          conversationId,
          receiver: userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date(),
          status: 'read'
        }
      );

      res.json({
        success: true,
        data: {
          messages: messages.reverse(),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: messages.length === parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation',
        error: error.message
      });
    }
  },

  // Get all conversations for a user
  getConversations: async (req, res) => {
    try {
      const userId = req.user.userId;
      const userType = req.user.role;

      // Get all conversations with latest message
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(userId) },
              { receiver: new mongoose.Types.ObjectId(userId) }
            ],
            isDeleted: false,
            deletedBy: { $not: { $elemMatch: { user: new mongoose.Types.ObjectId(userId) } } }
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: '$conversationId',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                      { $eq: ['$isRead', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { 'lastMessage.createdAt': -1 }
        }
      ]);

      // Populate user details
      const populatedConversations = [];
      for (const conv of conversations) {
        const otherUserId = conv.lastMessage.sender.toString() === userId 
          ? conv.lastMessage.receiver 
          : conv.lastMessage.sender;

        let otherUser;
        if (userType === 'doctor') {
          otherUser = await Patient.findById(otherUserId).select('name email userType');
        } else {
          otherUser = await Doctor.findById(otherUserId).select('name email userType specialization');
        }

        if (otherUser) {
          populatedConversations.push({
            conversationId: conv._id,
            otherUser,
            lastMessage: conv.lastMessage,
            unreadCount: conv.unreadCount
          });
        }
      }

      res.json({
        success: true,
        data: populatedConversations
      });

    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations',
        error: error.message
      });
    }
  },

  // Mark message as read
  markAsRead: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.userId;

      const message = await Message.findOne({
        _id: messageId,
        receiver: userId
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      await message.markAsRead();

      res.json({
        success: true,
        message: 'Message marked as read'
      });

    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark message as read',
        error: error.message
      });
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.userId;

      const message = await Message.findOne({
        _id: messageId,
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      // Add user to deletedBy array
      message.deletedBy.push({
        user: userId,
        deletedAt: new Date()
      });

      // If both users have deleted, mark as deleted
      const participants = [message.sender.toString(), message.receiver.toString()];
      const deletedByUsers = message.deletedBy.map(d => d.user.toString());
      
      if (participants.every(p => deletedByUsers.includes(p))) {
        message.isDeleted = true;
      }

      await message.save();

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });

    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: error.message
      });
    }
  },

  // Reply to a message
  replyToMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const { content, messageType = 'text' } = req.body;
      const senderId = req.user.userId;
      const senderType = req.user.role;

      const originalMessage = await Message.findById(messageId);
      if (!originalMessage) {
        return res.status(404).json({
          success: false,
          message: 'Original message not found'
        });
      }

      // Determine receiver (opposite of original sender if current user is receiver, otherwise original sender)
      const receiverId = originalMessage.sender.toString() === senderId 
        ? originalMessage.receiver 
        : originalMessage.sender;

      const receiverTypeMap = {
        doctor: 'patient',
        patient: 'doctor'
      };
      const receiverType = receiverTypeMap[senderType];

      const reply = new Message({
        sender: senderId,
        receiver: receiverId,
        senderType,
        receiverType,
        content,
        messageType,
        conversationId: originalMessage.conversationId,
        replyTo: messageId
      });

      await reply.save();

      await reply.populate([
        { path: 'sender', select: 'name email userType' },
        { path: 'receiver', select: 'name email userType' },
        { path: 'replyTo', select: 'content sender createdAt' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Reply sent successfully',
        data: reply
      });

    } catch (error) {
      console.error('Reply to message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send reply',
        error: error.message
      });
    }
  },

  // Get unread message count
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.userId;

      const unreadCount = await Message.countDocuments({
        receiver: userId,
        isRead: false,
        isDeleted: false,
        deletedBy: { $not: { $elemMatch: { user: userId } } }
      });

      res.json({
        success: true,
        data: { unreadCount }
      });

    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  },

  // Get available contacts for messaging (doctors/patients with appointment history)
  getAvailableContacts: async (req, res) => {
    try {
      const userId = req.user.userId;
      const userType = req.user.role;

      let contacts = [];

      if (userType === 'patient') {
        // For patients, get doctors they have appointments with
        const Appointment = mongoose.model('Appointment');
        const Doctor = mongoose.model('doctor');

        const appointments = await Appointment.find({
          patient: userId,
          status: { $in: ['pending', 'confirmed', 'completed'] }
        }).distinct('doctor');

        if (appointments.length > 0) {
          contacts = await Doctor.find({
            _id: { $in: appointments }
          }).select('_id name specialization email phone');
        }
      } else if (userType === 'doctor') {
        // For doctors, get patients they have appointments with
        const Appointment = mongoose.model('Appointment');
        const Patient = mongoose.model('patient');

        const appointments = await Appointment.find({
          doctor: userId,
          status: { $in: ['pending', 'confirmed', 'completed'] }
        }).distinct('patient');

        if (appointments.length > 0) {
          contacts = await Patient.find({
            _id: { $in: appointments }
          }).select('_id name email phone age gender');
        }
      }

      res.json({
        success: true,
        data: {
          contacts,
          count: contacts.length
        }
      });

    } catch (error) {
      console.error('Get available contacts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available contacts',
        error: error.message
      });
    }
  }
};

module.exports = messageController;