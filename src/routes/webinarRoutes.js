const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  submitWebinarRegistration,
  getWebinarRegistrations,
  getWebinarRegistration,
  updateWebinarStatus,
  deleteWebinarRegistration,
  resendWebinarEmail,
  getWebinarStats
} = require('../controllers/webinarController');
const {
  getWebinarConfig,
  updateWebinarConfig
} = require('../controllers/webinarConfigController');

// Public routes
router.get('/config', getWebinarConfig);
router.post('/', submitWebinarRegistration);

// Admin routes (protected)
router.put('/config', protect, checkAdmin, updateWebinarConfig);
router.get('/stats', protect, checkAdmin, getWebinarStats);
router.get('/registrations', protect, checkAdmin, getWebinarRegistrations);
router.get('/registrations/:id', protect, checkAdmin, getWebinarRegistration);
router.put('/registrations/:id', protect, checkAdmin, updateWebinarStatus);
router.post('/registrations/:id/resend-email', protect, checkAdmin, resendWebinarEmail);
router.delete('/registrations/:id', protect, checkAdmin, deleteWebinarRegistration);

module.exports = router;

