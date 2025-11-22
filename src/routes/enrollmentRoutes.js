const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getEnrolledCourses,
  checkEnrollment,
  getCourseContent
} = require('../controllers/enrollmentController');

// All enrollment routes require authentication
router.use(protect);

// Get user's enrolled courses
router.get('/my-courses', getEnrolledCourses);

// Check if user is enrolled in a course
router.get('/check/:courseId', checkEnrollment);

// Get course content (only for enrolled users)
router.get('/course/:courseId/content', getCourseContent);

module.exports = router;

