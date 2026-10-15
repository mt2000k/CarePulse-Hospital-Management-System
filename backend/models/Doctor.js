const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required']
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required']
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0
    },
    bio: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
