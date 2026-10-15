const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all patients with search & pagination (Admin / Doctor)
// @route   GET /api/patients
// @access  Private (Admin or Doctor)
const getPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const { search, gender, bloodGroup } = req.query;

    let patientQuery = {};
    if (gender) patientQuery.gender = gender;
    if (bloodGroup) patientQuery.bloodGroup = bloodGroup;

    let patients = await Patient.find(patientQuery)
      .populate('userId', 'name email phone avatar status createdAt')
      .sort({ createdAt: -1 });

    if (search) {
      const regex = new RegExp(search, 'i');
      patients = patients.filter(p => {
        const u = p.userId;
        return u && (regex.test(u.name) || regex.test(u.email) || regex.test(u.phone));
      });
    }

    const total = patients.length;
    const paginated = patients.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      count: paginated.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: paginated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('userId', 'name email phone avatar status createdAt');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (req.user.role === 'patient' && req.patient) {
      if (patient._id.toString() !== req.patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    // Also get appointment summary for this patient
    const appointmentCount = await Appointment.countDocuments({ patientId: patient._id });

    res.status(200).json({
      success: true,
      data: {
        ...patient.toObject(),
        totalAppointments: appointmentCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Private (Admin or Patient owner)
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (req.user.role === 'patient' && req.patient) {
      if (patient._id.toString() !== req.patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this patient' });
      }
    }

    const { name, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory } = req.body;

    // Update user info
    if (name || phone) {
      const user = await User.findById(patient.userId);
      if (user) {
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        await user.save();
      }
    }

    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (address) patient.address = address;
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;

    await patient.save();

    const updated = await Patient.findById(patient._id).populate('userId', 'name email phone avatar status');

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  updatePatient
};
