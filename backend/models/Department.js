const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Department description is required']
    },
    image: {
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

module.exports = mongoose.model('Department', departmentSchema);
