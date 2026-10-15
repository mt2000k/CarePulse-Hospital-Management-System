const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const DoctorSchedule = require('../models/DoctorSchedule');
const Department = require('../models/Department');

// Helper: generate appointment number
const generateAppointmentNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `APT-${dateStr}-${randomStr}`;
};

// @desc    Create / Book a new Appointment (Strict Double-Booking Protection)
// @route   POST /api/appointments
// @access  Private (Patient or Admin)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, departmentId, appointmentDate, appointmentTime, reason, appointmentType } = req.body;

    let patientId = req.body.patientId;

    if (req.user.role === 'patient') {
      if (!req.patient) {
        return res.status(400).json({
          success: false,
          message: 'Patient profile not found. Please complete your registration.'
        });
      }
      patientId = req.patient._id;
    }

    if (!patientId || !doctorId || !departmentId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, departmentId, appointmentDate, appointmentTime, and reason'
      });
    }

    // 1. Verify doctor exists & active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'The selected doctor is currently inactive or not available'
      });
    }

    // 2. Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Patient record not found'
      });
    }

    // 3. Prevent past date booking
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Appointments cannot be booked for past dates'
      });
    }

    // 4. Determine Day of Week
    const dateObj = new Date(appointmentDate + 'T00:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    // 5. Verify doctor works on selected date/day
    const schedule = await DoctorSchedule.findOne({
      doctorId,
      dayOfWeek,
      status: 'active'
    });

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: `Doctor ${doctor.specialization} does not have a schedule configured for ${dayOfWeek}s`
      });
    }

    // 6. Verify time is within working hours
    const [reqH, reqM] = appointmentTime.split(':').map(Number);
    const reqMins = reqH * 60 + reqM;

    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const startMins = startH * 60 + startM;

    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const endMins = endH * 60 + endM;

    if (reqMins < startMins || reqMins >= endMins) {
      return res.status(400).json({
        success: false,
        message: `Selected time (${appointmentTime}) is outside doctor working hours (${schedule.startTime} - ${schedule.endTime})`
      });
    }

    // Check break time
    if (schedule.breakStart && schedule.breakEnd) {
      const [bStartH, bStartM] = schedule.breakStart.split(':').map(Number);
      const bStartMins = bStartH * 60 + bStartM;
      const [bEndH, bEndM] = schedule.breakEnd.split(':').map(Number);
      const bEndMins = bEndH * 60 + bEndM;

      if (reqMins >= bStartMins && reqMins < bEndMins) {
        return res.status(400).json({
          success: false,
          message: `Selected time (${appointmentTime}) falls during the doctor break hour (${schedule.breakStart} - ${schedule.breakEnd})`
        });
      }
    }

    // 7. Check double booking
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'The selected appointment slot is no longer available. Another patient has booked this time.'
      });
    }

    // 8. Create Appointment
    const appointmentNumber = generateAppointmentNumber();

    const appointment = await Appointment.create({
      appointmentNumber,
      patientId,
      doctorId,
      departmentId,
      appointmentDate,
      appointmentTime,
      reason,
      appointmentType: appointmentType || 'Consultation',
      status: 'Pending'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('departmentId', 'name description');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Appointments with search, filters & pagination
// @route   GET /api/appointments
// @access  Private (Role Scoped)
const getAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const { status, doctorId, patientId, departmentId, date, search } = req.query;

    let query = {};

    // Role-based Access Control Filtering
    if (req.user.role === 'patient') {
      if (!req.patient) {
        return res.status(200).json({ success: true, count: 0, pagination: { page: 1, limit, total: 0, totalPages: 0 }, data: [] });
      }
      query.patientId = req.patient._id;
    } else if (req.user.role === 'doctor') {
      if (!req.doctor) {
        return res.status(200).json({ success: true, count: 0, pagination: { page: 1, limit, total: 0, totalPages: 0 }, data: [] });
      }
      query.doctorId = req.doctor._id;
    }

    if (status) query.status = status;
    if (doctorId && req.user.role === 'admin') query.doctorId = doctorId;
    if (patientId && req.user.role === 'admin') query.patientId = patientId;
    if (departmentId) query.departmentId = departmentId;
    if (date) query.appointmentDate = date;

    let appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' },
        select: 'qualification specialization consultationFee'
      })
      .populate('departmentId', 'name description')
      .sort({ appointmentDate: -1, appointmentTime: 1 });

    // Client-side / regex search on patient name or appointment number if requested
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      appointments = appointments.filter(apt => {
        const pName = apt.patientId && apt.patientId.userId ? apt.patientId.userId.name : '';
        const dName = apt.doctorId && apt.doctorId.userId ? apt.doctorId.userId.name : '';
        return (
          searchRegex.test(apt.appointmentNumber) ||
          searchRegex.test(pName) ||
          searchRegex.test(dName) ||
          searchRegex.test(apt.reason)
        );
      });
    }

    const total = appointments.length;
    const paginated = appointments.slice(startIndex, startIndex + limit);

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

// @desc    Get Appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('departmentId', 'name description');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Role check
    if (req.user.role === 'patient' && req.patient) {
      if (appointment.patientId._id.toString() !== req.patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this appointment' });
      }
    } else if (req.user.role === 'doctor' && req.doctor) {
      if (appointment.doctorId._id.toString() !== req.doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this appointment' });
      }
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Appointment Status (Confirm, Reject, Complete, Cancel)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor, Patient, Admin)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes, cancellationReason } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected', 'No-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Authorization & Rule checks
    if (req.user.role === 'patient') {
      if (!req.patient || appointment.patientId.toString() !== req.patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
      }

      // Patients can only cancel pending/confirmed appointments
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
      }

      if (['Completed', 'Cancelled', 'Rejected'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}`
        });
      }
    } else if (req.user.role === 'doctor') {
      if (!req.doctor || appointment.doctorId.toString() !== req.doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized for this doctor appointment' });
      }
    }

    appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (cancellationReason !== undefined) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('departmentId', 'name');

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus
};
