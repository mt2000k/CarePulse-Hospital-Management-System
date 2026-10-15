const express = require('express');
const router = express.Router();
const {
  getDoctorSchedules,
  getAvailableSlots,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/doctor/:doctorId', getDoctorSchedules);
router.get('/available-slots', getAvailableSlots);

router.post('/', protect, authorize('doctor', 'admin'), createSchedule);
router.put('/:id', protect, authorize('doctor', 'admin'), updateSchedule);
router.delete('/:id', protect, authorize('doctor', 'admin'), deleteSchedule);

module.exports = router;
