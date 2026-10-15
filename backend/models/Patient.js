const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    emergencyContact: {
      type: String,
      default: ''
    },
    medicalHistory: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Patient', patientSchema);
