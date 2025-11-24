const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  getIndustryConfig,
  updateIndustryConfig
} = require('../controllers/industryConfigController');

// Public routes
router.get('/config', getIndustryConfig);

// Admin routes (protected)
router.put('/config', protect, checkAdmin, updateIndustryConfig);

module.exports = router;

