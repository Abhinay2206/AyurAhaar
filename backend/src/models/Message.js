const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  senderType: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  },
  receiverType: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'appointment_update'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  subject: {
    type: String,
    maxlength: 200
  },
  // To group messages in conversation threads
  conversationId: {
    type: String,
    required: true
  },
  // For reply functionality
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ isRead: 1, receiver: 1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.sender, this.receiver];
});

// Static method to create conversation ID
messageSchema.statics.createConversationId = function(userId1, userId2) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `conv_${ids[0]}_${ids[1]}`;
};

// Static method to check if doctor-patient relationship exists
messageSchema.statics.validateDoctorPatientRelationship = async function(doctorId, patientId) {
  try {
    const Doctor = mongoose.model('doctor');
    const Patient = mongoose.model('patient');
    const Appointment = mongoose.model('Appointment');

    console.log(`Checking relationship for Doctor: ${doctorId}, Patient: ${patientId}`);

    // Validate that both IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(patientId)) {
      console.log('Invalid ObjectIds provided');
      return false;
    }

    // Check if they have had appointments together (including pending appointments)
    const appointment = await Appointment.findOne({
      doctor: doctorId,
      patient: patientId,
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    console.log(`Appointment found: ${appointment ? 'Yes' : 'No'}`);
    if (appointment) {
      console.log(`Appointment status: ${appointment.status}, Date: ${appointment.date}`);
      return true;
    }

    // Check if patient is in doctor's patient list
    const doctor = await Doctor.findById(doctorId);
    if (doctor && doctor.patients && doctor.patients.includes(patientId)) {
      console.log('Patient found in doctor\'s patient list');
      return true;
    }

    console.log('No relationship found');
    return false;
  } catch (error) {
    console.error('Error validating doctor-patient relationship:', error);
    return false;
  }
};

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.status = 'read';
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;