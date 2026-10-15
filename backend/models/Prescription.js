const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },       // e.g., "500mg"
  frequency: { type: String, required: true },    // e.g., "Twice daily"
  duration: { type: String, required: true },     // e.g., "5 days"
  instructions: { type: String, default: '' }     // e.g., "Take after meals"
});

const prescriptionSchema = new mongoose.Schema(
  {
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
      required: true,
      index: true
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
    medicines: [medicineItemSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
