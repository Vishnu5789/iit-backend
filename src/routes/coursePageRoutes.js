const express = require('express');
const router = express.Router();
const { getCoursePageConfig, updateCoursePageConfig } = require('../controllers/coursePageController');
const { protect, authorize } = require('../middleware/auth');

// Public route - Get course page configuration
router.get('/config', getCoursePageConfig);

// Admin routes
router.put('/config', protect, authorize('admin'), updateCoursePageConfig);

module.exports = router;
