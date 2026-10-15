const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
      index: true
    },
    symptoms: {
      type: String,
      required: [true, 'Symptoms description is required']
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required']
    },
    consultationNotes: {
      type: String,
      default: ''
    },
    followUpInstructions: {
      type: String,
      default: ''
    },
    consultationDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
