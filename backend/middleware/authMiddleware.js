const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing'
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support/administrator.'
      });
    }

    req.user = user;

    // Attach role-specific entity IDs if applicable
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      if (doctorProfile) req.doctor = doctorProfile;
    } else if (user.role === 'patient') {
      const patientProfile = await Patient.findOne({ userId: user._id });
      if (patientProfile) req.patient = patientProfile;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token validation failed'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
