const DoctorSchedule = require('../models/DoctorSchedule');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Helper: convert "HH:mm" to minutes since midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper: convert minutes since midnight to "HH:mm"
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// @desc    Get schedules for a doctor
// @route   GET /api/schedules/doctor/:doctorId
// @access  Public
const getDoctorSchedules = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const schedules = await DoctorSchedule.find({ doctorId }).sort({ dayOfWeek: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/schedules/available-slots
// @access  Public
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query; // date format: YYYY-MM-DD

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'doctorId and date parameters are required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or inactive'
      });
    }

    // Determine Day of Week from date string
    const dateObj = new Date(date + 'T00:00:00');
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    // Find doctor schedule for this day
    const schedule = await DoctorSchedule.findOne({
      doctorId,
      dayOfWeek,
      status: 'active'
    });

    if (!schedule) {
      return res.status(200).json({
        success: true,
        message: `Doctor is not available on ${dayOfWeek}s`,
        dayOfWeek,
        availableSlots: []
      });
    }

    const startMins = timeToMinutes(schedule.startTime);
    const endMins = timeToMinutes(schedule.endTime);
    const breakStartMins = timeToMinutes(schedule.breakStart);
    const breakEndMins = timeToMinutes(schedule.breakEnd);
    const duration = schedule.slotDuration || 30;

    if (endMins <= startMins) {
      return res.status(200).json({
        success: true,
        availableSlots: []
      });
    }

    // Generate potential slots
    const allSlots = [];
    for (let cur = startMins; cur + duration <= endMins; cur += duration) {
      // Check break time overlap
      if (breakStartMins && breakEndMins) {
        if (cur < breakEndMins && (cur + duration) > breakStartMins) {
          continue; // Slot overlaps with break
        }
      }
      allSlots.push(minutesToTime(cur));
    }

    // Fetch existing appointments on this date
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: date,
      status: { $nin: ['Cancelled', 'Rejected'] }
    }).select('appointmentTime');

    const bookedTimes = new Set(bookedAppointments.map(a => a.appointmentTime));

    // Filter available slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));

    res.status(200).json({
      success: true,
      dayOfWeek,
      schedule: {
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        breakStart: schedule.breakStart,
        breakEnd: schedule.breakEnd,
        slotDuration: schedule.slotDuration
      },
      availableSlots
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add/Create Doctor Schedule
// @route   POST /api/schedules
// @access  Private/Doctor or Admin
const createSchedule = async (req, res, next) => {
  try {
    const { doctorId, dayOfWeek, startTime, endTime, breakStart, breakEnd, slotDuration, maxAppointments } = req.body;

    if (!doctorId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'doctorId, dayOfWeek, startTime, and endTime are required'
      });
    }

    // Authorization check
    if (req.user.role === 'doctor') {
      if (!req.doctor || req.doctor._id.toString() !== doctorId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create schedule for another doctor'
        });
      }
    }

    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    if (endMins <= startMins) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    if (breakStart && breakEnd) {
      const bStart = timeToMinutes(breakStart);
      const bEnd = timeToMinutes(breakEnd);
      if (bEnd <= bStart) {
        return res.status(400).json({
          success: false,
          message: 'Break end time must be after break start time'
        });
      }
      if (bStart < startMins || bEnd > endMins) {
        return res.status(400).json({
          success: false,
          message: 'Break time must fall within working hours'
        });
      }
    }

    // Check if schedule already exists for this day
    const existing = await DoctorSchedule.findOne({ doctorId, dayOfWeek });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Schedule for ${dayOfWeek} already exists for this doctor. Please update existing schedule.`
      });
    }

    const schedule = await DoctorSchedule.create({
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      breakStart: breakStart || '',
      breakEnd: breakEnd || '',
      slotDuration: slotDuration || 30,
      maxAppointments: maxAppointments || 20,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Doctor Schedule
// @route   PUT /api/schedules/:id
// @access  Private/Doctor or Admin
const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await DoctorSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (req.user.role === 'doctor') {
      if (!req.doctor || req.doctor._id.toString() !== schedule.doctorId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this schedule'
        });
      }
    }

    const { startTime, endTime, breakStart, breakEnd, slotDuration, maxAppointments, status } = req.body;

    const newStart = startTime || schedule.startTime;
    const newEnd = endTime || schedule.endTime;

    if (timeToMinutes(newEnd) <= timeToMinutes(newStart)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    if (startTime !== undefined) schedule.startTime = startTime;
    if (endTime !== undefined) schedule.endTime = endTime;
    if (breakStart !== undefined) schedule.breakStart = breakStart;
    if (breakEnd !== undefined) schedule.breakEnd = breakEnd;
    if (slotDuration !== undefined) schedule.slotDuration = slotDuration;
    if (maxAppointments !== undefined) schedule.maxAppointments = maxAppointments;
    if (status !== undefined) schedule.status = status;

    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Doctor Schedule
// @route   DELETE /api/schedules/:id
// @access  Private/Doctor or Admin
const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await DoctorSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (req.user.role === 'doctor') {
      if (!req.doctor || req.doctor._id.toString() !== schedule.doctorId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this schedule'
        });
      }
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctorSchedules,
  getAvailableSlots,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
