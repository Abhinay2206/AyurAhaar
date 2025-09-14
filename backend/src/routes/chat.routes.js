const express = require('express');
const axios = require('axios');
const Chat = require('../models/Chat');
const router = express.Router();

// Environment configuration
const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

/**
 * POST /api/chat
 * Send a message to the RAG chatbot
 */
router.post('/', async (req, res) => {
  try {
    const { message, patientId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`📨 Chat request from patient: ${patientId || 'anonymous'}`);
    console.log(`💬 Message: ${message}`);

    // Forward to AI server RAG chatbot
    try {
      const aiResponse = await axios.post(`${AI_SERVER_URL}/rag-chat`, {
        message: message.trim()
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const aiReply = aiResponse.data.reply || 'I apologize, but I couldn\'t process your request.';

      // Store chat in database if patientId is provided
      let chatRecord = null;
      if (patientId) {
        try {
          chatRecord = new Chat({
            patientId,
            userMessage: message.trim(),
            botResponse: aiReply,
            timestamp: new Date(),
            source: 'rag-chatbot'
          });
          await chatRecord.save();
          console.log(`💾 Chat saved to database for patient: ${patientId}`);
        } catch (dbError) {
          console.error('❌ Error saving chat to database:', dbError);
          // Continue even if DB save fails
        }
      }

      console.log(`🤖 AI Response: ${aiReply.substring(0, 100)}...`);

      res.json({
        success: true,
        reply: aiReply,
        chatId: chatRecord?._id
      });

    } catch (aiError) {
      console.error('❌ AI Server Error:', aiError.message);
      
      // Fallback response if AI server is down
      const fallbackResponse = "I'm currently having trouble connecting to my knowledge base. Please try again in a moment, or contact support if the issue persists.";
      
      // Still try to save the interaction
      if (patientId) {
        try {
          const chatRecord = new Chat({
            patientId,
            userMessage: message.trim(),
            botResponse: fallbackResponse,
            timestamp: new Date(),
            source: 'fallback',
            error: aiError.message
          });
          await chatRecord.save();
        } catch (dbError) {
          console.error('❌ Error saving fallback chat to database:', dbError);
        }
      }

      res.json({
        success: false,
        reply: fallbackResponse,
        error: 'AI service temporarily unavailable'
      });
    }

  } catch (error) {
    console.error('❌ Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      reply: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.'
    });
  }
});

/**
 * GET /api/chat/history/:patientId
 * Get chat history for a patient
 */
router.get('/history/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    const chatHistory = await Chat.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    res.json({
      success: true,
      messages: chatHistory.reverse(), // Reverse to get chronological order
      count: chatHistory.length
    });

  } catch (error) {
    console.error('❌ Chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history'
    });
  }
});

/**
 * DELETE /api/chat/history/:patientId
 * Clear chat history for a patient
 */
router.delete('/history/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    const result = await Chat.deleteMany({ patientId });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} chat messages`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('❌ Clear chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat history'
    });
  }
});

module.exports = router;