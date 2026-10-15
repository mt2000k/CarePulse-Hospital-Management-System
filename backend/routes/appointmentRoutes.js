const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createAppointment)
  .get(getAppointments);

router.route('/:id')
  .get(getAppointmentById);

router.patch('/:id/status', updateAppointmentStatus);

module.exports = router;
