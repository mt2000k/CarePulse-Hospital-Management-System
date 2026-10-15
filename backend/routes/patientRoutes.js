const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  updatePatient
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'doctor'), getPatients);
router.route('/:id')
  .get(getPatientById)
  .put(updatePatient);

module.exports = router;
