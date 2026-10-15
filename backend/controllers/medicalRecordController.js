const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Create Medical Record & Prescription
// @route   POST /api/medical-records
// @access  Private/Doctor
const createMedicalRecord = async (req, res, next) => {
  try {
    const {
      appointmentId,
      symptoms,
      diagnosis,
      consultationNotes,
      followUpInstructions,
      medicines // array of { name, dosage, frequency, duration, instructions }
    } = req.body;

    if (!appointmentId || !symptoms || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId, symptoms, and diagnosis are required'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify doctor authority
    if (req.user.role === 'doctor') {
      if (!req.doctor || appointment.doctorId.toString() !== req.doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to add medical records for this doctor'
        });
      }
    }

    // Check if medical record already exists for this appointment
    let medicalRecord = await MedicalRecord.findOne({ appointmentId });
    if (medicalRecord) {
      // Update existing record
      medicalRecord.symptoms = symptoms;
      medicalRecord.diagnosis = diagnosis;
      if (consultationNotes !== undefined) medicalRecord.consultationNotes = consultationNotes;
      if (followUpInstructions !== undefined) medicalRecord.followUpInstructions = followUpInstructions;
      await medicalRecord.save();
    } else {
      // Create new record
      medicalRecord = await MedicalRecord.create({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId,
        symptoms,
        diagnosis,
        consultationNotes: consultationNotes || '',
        followUpInstructions: followUpInstructions || ''
      });
    }

    // Handle Prescription if medicines provided
    let prescription = null;
    if (medicines && Array.isArray(medicines) && medicines.length > 0) {
      prescription = await Prescription.findOne({ medicalRecordId: medicalRecord._id });
      if (prescription) {
        prescription.medicines = medicines;
        await prescription.save();
      } else {
        prescription = await Prescription.create({
          medicalRecordId: medicalRecord._id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          medicines
        });
      }
    }

    // Automatically mark appointment as Completed
    appointment.status = 'Completed';
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Medical record and prescription created successfully',
      data: {
        medicalRecord,
        prescription
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Medical Records for a patient
// @route   GET /api/medical-records/patient/:patientId
// @access  Private (Patient owner, assigned Doctor, or Admin)
const getMedicalRecordsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Security check
    if (req.user.role === 'patient') {
      if (!req.patient || req.patient._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access medical records of another patient'
        });
      }
    }

    const records = await MedicalRecord.find({ patientId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' },
        populate: { path: 'departmentId', select: 'name' }
      })
      .populate('appointmentId', 'appointmentNumber appointmentDate appointmentTime reason')
      .sort({ createdAt: -1 });

    // Fetch matching prescriptions for each record
    const recordsWithPrescriptions = await Promise.all(
      records.map(async (rec) => {
        const prescription = await Prescription.findOne({ medicalRecordId: rec._id });
        return {
          ...rec.toObject(),
          prescription: prescription ? prescription.medicines : []
        };
      })
    );

    res.status(200).json({
      success: true,
      count: recordsWithPrescriptions.length,
      data: recordsWithPrescriptions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Medical Record by ID
// @route   GET /api/medical-records/:id
// @access  Private
const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone gender dateOfBirth bloodGroup' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
        populate: { path: 'departmentId', select: 'name' }
      })
      .populate('appointmentId');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    if (req.user.role === 'patient' && req.patient) {
      if (record.patientId._id.toString() !== req.patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this record' });
      }
    }

    const prescription = await Prescription.findOne({ medicalRecordId: record._id });

    res.status(200).json({
      success: true,
      data: {
        ...record.toObject(),
        prescription: prescription ? prescription.medicines : []
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  getMedicalRecordById
};
