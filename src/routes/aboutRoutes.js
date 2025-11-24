const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  getAboutConfig,
  updateAboutConfig
} = require('../controllers/aboutController');

// Public routes
router.get('/config', getAboutConfig);

// Admin routes (protected)
router.put('/config', protect, checkAdmin, updateAboutConfig);

module.exports = router;

