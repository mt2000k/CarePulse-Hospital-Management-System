const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true
    },
    appointmentDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required'],
      index: true
    },
    appointmentTime: {
      type: String, // Format: HH:mm (e.g., "10:30")
      required: [true, 'Appointment time is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required']
    },
    appointmentType: {
      type: String,
      enum: ['General Checkup', 'Follow-up', 'Consultation', 'Emergency'],
      default: 'Consultation'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected', 'No-show'],
      default: 'Pending',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
