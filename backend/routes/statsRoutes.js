const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getDoctorStats,
  getPatientStats
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin', authorize('admin'), getAdminStats);
router.get('/doctor', authorize('doctor'), getDoctorStats);
router.get('/patient', authorize('patient'), getPatientStats);

module.exports = router;
