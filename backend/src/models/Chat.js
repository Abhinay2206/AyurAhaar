const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  userMessage: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  botResponse: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    enum: ['rag-chatbot', 'fallback', 'manual'],
    default: 'rag-chatbot'
  },
  error: {
    type: String,
    required: false
  },
  metadata: {
    responseTime: Number,
    confidence: Number,
    sources: [String]
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ patientId: 1, timestamp: -1 });

// Virtual for formatted timestamp
chatSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Instance method to sanitize for API response
chatSchema.methods.toAPI = function() {
  return {
    _id: this._id,
    userMessage: this.userMessage,
    botResponse: this.botResponse,
    timestamp: this.timestamp,
    source: this.source,
    formattedTimestamp: this.formattedTimestamp
  };
};

module.exports = mongoose.model('Chat', chatSchema);