const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  getMedicalRecordById
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('doctor', 'admin'), createMedicalRecord);
router.get('/patient/:patientId', getMedicalRecordsByPatient);
router.get('/:id', getMedicalRecordById);

module.exports = router;
