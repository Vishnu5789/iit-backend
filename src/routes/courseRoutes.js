const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected admin routes
router.post('/', protect, checkAdmin, createCourse);
router.put('/:id', protect, checkAdmin, updateCourse);
router.delete('/:id', protect, checkAdmin, deleteCourse);

module.exports = router;

