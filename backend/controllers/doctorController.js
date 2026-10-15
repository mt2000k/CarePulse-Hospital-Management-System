const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const DoctorSchedule = require('../models/DoctorSchedule');

// @desc    Get doctors list with search, filtering & pagination
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const { name, departmentId, specialization, status } = req.query;

    let doctorQuery = {};

    if (status) {
      doctorQuery.status = status;
    }

    if (departmentId) {
      doctorQuery.departmentId = departmentId;
    }

    if (specialization) {
      doctorQuery.specialization = { $regex: specialization, $options: 'i' };
    }

    // Populate user and filter by name if specified
    let doctors = await Doctor.find(doctorQuery)
      .populate('userId', 'name email phone avatar status')
      .populate('departmentId', 'name description image')
      .sort({ createdAt: -1 });

    if (name) {
      const searchRegex = new RegExp(name, 'i');
      doctors = doctors.filter(doc => doc.userId && searchRegex.test(doc.userId.name));
    }

    const total = doctors.length;
    const paginatedDoctors = doctors.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      count: paginatedDoctors.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: paginatedDoctors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone avatar status')
      .populate('departmentId', 'name description image');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Fetch active schedules
    const schedules = await DoctorSchedule.find({ doctorId: doctor._id, status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        ...doctor.toObject(),
        schedules
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Add/Create Doctor Account
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      departmentId,
      qualification,
      specialization,
      experience,
      consultationFee,
      bio,
      profileImage
    } = req.body;

    if (!name || !email || !password || !departmentId || !qualification || !specialization || consultationFee === undefined || experience === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password, departmentId, qualification, specialization, experience, consultationFee)'
      });
    }

    // Check department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check user email uniqueness
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create User with role 'doctor'
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'doctor',
      phone: phone || '',
      avatar: profileImage || ''
    });

    // Create Doctor profile
    const doctor = await Doctor.create({
      userId: user._id,
      departmentId,
      qualification,
      specialization,
      experience,
      consultationFee,
      bio: bio || '',
      profileImage: profileImage || ''
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone avatar status')
      .populate('departmentId', 'name');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: populatedDoctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Doctor profile details
// @route   PUT /api/doctors/:id
// @access  Private/Admin or Doctor owner
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Authorization check: Admin or the Doctor himself
    if (req.user.role !== 'admin' && doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile'
      });
    }

    const {
      name,
      phone,
      qualification,
      specialization,
      experience,
      consultationFee,
      bio,
      profileImage,
      departmentId,
      status
    } = req.body;

    // Update associated User details
    const user = await User.findById(doctor.userId);
    if (user) {
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (profileImage) user.avatar = profileImage;
      if (status && req.user.role === 'admin') user.status = status;
      await user.save();
    }

    if (qualification) doctor.qualification = qualification;
    if (specialization) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (bio !== undefined) doctor.bio = bio;
    if (profileImage !== undefined) doctor.profileImage = profileImage;
    if (departmentId && req.user.role === 'admin') doctor.departmentId = departmentId;
    if (status && req.user.role === 'admin') doctor.status = status;

    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone avatar status')
      .populate('departmentId', 'name');

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: updatedDoctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Doctor Status (Activate / Deactivate)
// @route   PATCH /api/doctors/:id/status
// @access  Private/Admin
const toggleDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const newStatus = doctor.status === 'active' ? 'inactive' : 'active';
    doctor.status = newStatus;
    await doctor.save();

    // Also update User account status
    await User.findByIdAndUpdate(doctor.userId, { status: newStatus });

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${newStatus}`,
      data: {
        id: doctor._id,
        status: newStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus
};
