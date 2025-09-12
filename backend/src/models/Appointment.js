const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
