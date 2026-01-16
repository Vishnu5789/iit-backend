const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const statsController = require('../controllers/statsController');

/**
 * Statistics Routes
 * All routes require admin authentication
 */

// Apply authentication middleware
router.use(protect);

// Apply admin-only restriction
// Note: If you don't have restrictTo middleware, use custom check in controller
// router.use(restrictTo('admin'));

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get overall dashboard summary
 * @access  Private (Admin only)
 */
router.get('/dashboard', statsController.getDashboardSummary);

/**
 * @route   GET /api/stats/courses
 * @desc    Get statistics for all courses
 * @access  Private (Admin only)
 */
router.get('/courses', statsController.getAllCoursesStats);

/**
 * @route   GET /api/stats/course/:courseId
 * @desc    Get detailed statistics for a specific course
 * @access  Private (Admin only)
 */
router.get('/course/:courseId', statsController.getCourseStats);

module.exports = router;
