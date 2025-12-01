const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  getCourseQuizzes,
  getQuiz,
  startQuiz,
  submitQuiz,
  getUserAttempts,
  getAdminCourseQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizAttempts
} = require('../controllers/quizController');

// Student routes (protected)
router.get('/course/:courseId', protect, getCourseQuizzes);
router.get('/:id', protect, getQuiz);
router.post('/:id/start', protect, startQuiz);
router.post('/attempt/:attemptId/submit', protect, submitQuiz);
router.get('/:quizId/attempts', protect, getUserAttempts);

// Admin routes
router.get('/admin/course/:courseId', protect, checkAdmin, getAdminCourseQuizzes);
router.post('/', protect, checkAdmin, createQuiz);
router.put('/:id', protect, checkAdmin, updateQuiz);
router.delete('/:id', protect, checkAdmin, deleteQuiz);
router.get('/admin/:quizId/attempts', protect, checkAdmin, getQuizAttempts);

module.exports = router;

