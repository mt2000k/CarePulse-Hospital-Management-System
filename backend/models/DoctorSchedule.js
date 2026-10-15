const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Day of week is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'] // Format: "09:00"
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'] // Format: "17:00"
    },
    breakStart: {
      type: String,
      default: '' // Format: "13:00"
    },
    breakEnd: {
      type: String,
      default: '' // Format: "14:00"
    },
    slotDuration: {
      type: Number,
      default: 30 // Duration per slot in minutes
    },
    maxAppointments: {
      type: Number,
      default: 20
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

// Prevent duplicate schedule for same doctor on same day of week
doctorScheduleSchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);
