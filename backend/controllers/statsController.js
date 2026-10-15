const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get Admin Dashboard Statistics & Analytics
// @route   GET /api/stats/admin
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments({ status: 'active' }),
      Department.countDocuments({ status: 'active' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentDate: todayStr }),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' })
    ]);

    // Appointments by Status breakdown
    const statusCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusChartData = statusCounts.map(item => ({
      name: item._id,
      value: item.count
    }));

    // Appointments by Department breakdown
    const departmentCounts = await Appointment.aggregate([
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept'
        }
      },
      {
        $unwind: { path: '$dept', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          name: { $ifNull: ['$dept.name', 'General'] },
          count: 1
        }
      }
    ]);

    // Recent 5 appointments
    const recentAppointments = await Appointment.find()
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalDepartments,
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments
      },
      charts: {
        statusDistribution: statusChartData,
        departmentDistribution: departmentCounts
      },
      recentAppointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Doctor Dashboard Statistics
// @route   GET /api/stats/doctor
// @access  Private/Doctor
const getDoctorStats = async (req, res, next) => {
  try {
    if (!req.doctor) {
      return res.status(400).json({ success: false, message: 'Doctor profile not found' });
    }

    const doctorId = req.doctor._id;
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId }),
      Appointment.countDocuments({ doctorId, appointmentDate: todayStr }),
      Appointment.countDocuments({ doctorId, status: 'Pending' }),
      Appointment.countDocuments({ doctorId, status: 'Completed' }),
      Appointment.countDocuments({ doctorId, status: 'Cancelled' })
    ]);

    // Distinct patients treated
    const patientIds = await Appointment.distinct('patientId', { doctorId, status: 'Completed' });

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        totalPatientsTreated: patientIds.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Patient Dashboard Statistics
// @route   GET /api/stats/patient
// @access  Private/Patient
const getPatientStats = async (req, res, next) => {
  try {
    if (!req.patient) {
      return res.status(400).json({ success: false, message: 'Patient profile not found' });
    }

    const patientId = req.patient._id;
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      medicalRecordsCount
    ] = await Promise.all([
      Appointment.countDocuments({ patientId }),
      Appointment.countDocuments({
        patientId,
        appointmentDate: { $gte: todayStr },
        status: { $in: ['Pending', 'Confirmed'] }
      }),
      Appointment.countDocuments({ patientId, status: 'Completed' }),
      Appointment.countDocuments({ patientId, status: 'Cancelled' }),
      MedicalRecord.countDocuments({ patientId })
    ]);

    // Next upcoming appointment
    const nextAppointment = await Appointment.findOne({
      patientId,
      appointmentDate: { $gte: todayStr },
      status: { $in: ['Pending', 'Confirmed'] }
    })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name avatar' }, select: 'specialization qualification' })
      .populate('departmentId', 'name')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
        medicalRecordsCount
      },
      nextAppointment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminStats,
  getDoctorStats,
  getPatientStats
};
