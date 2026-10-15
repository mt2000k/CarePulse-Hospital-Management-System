const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new Patient
// @route   POST /api/auth/register
// @access  Public
const registerPatient = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact
    } = req.body;

    // Basic Validation
    if (!name || !email || !password || !dateOfBirth || !gender || !bloodGroup || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered. Please login or use a different email.'
      });
    }

    // Create User record
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'patient',
      phone: phone || ''
    });

    // Create Patient Profile
    const patient = await Patient.create({
      userId: user._id,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact: emergencyContact || ''
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        patientId: patient._id
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate User & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check user & password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const token = generateToken(user._id, user.role);

    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id }).populate('departmentId', 'name');
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id }).populate('departmentId', 'name');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, emergencyContact, medicalHistory, qualification, specialization, bio, consultationFee, experience } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
      if (profile) {
        if (address) profile.address = address;
        if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
        if (medicalHistory !== undefined) profile.medicalHistory = medicalHistory;
        await profile.save();
      }
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
      if (profile) {
        if (qualification) profile.qualification = qualification;
        if (specialization) profile.specialization = specialization;
        if (bio !== undefined) profile.bio = bio;
        if (consultationFee !== undefined) profile.consultationFee = consultationFee;
        if (experience !== undefined) profile.experience = experience;
        await profile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerPatient,
  login,
  getMe,
  updateProfile
};
