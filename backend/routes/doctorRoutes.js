const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getDoctors)
  .post(protect, authorize('admin'), createDoctor);

router.route('/:id')
  .get(getDoctorById)
  .put(protect, updateDoctor);

router.patch('/:id/status', protect, authorize('admin'), toggleDoctorStatus);

module.exports = router;
