const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  submitAdmission,
  getAdmissions,
  getAdmission,
  updateAdmissionStatus,
  deleteAdmission,
  getAdmissionStats
} = require('../controllers/admissionController');

// Public route - submit admission form
router.post('/', submitAdmission);

// Admin routes (protected)
router.get('/stats', protect, checkAdmin, getAdmissionStats);
router.get('/', protect, checkAdmin, getAdmissions);
router.get('/:id', protect, checkAdmin, getAdmission);
router.put('/:id', protect, checkAdmin, updateAdmissionStatus);
router.delete('/:id', protect, checkAdmin, deleteAdmission);

module.exports = router;

