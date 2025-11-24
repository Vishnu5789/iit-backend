const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  getAllUsers,
  getUserById,
  enrollUserInCourse,
  unenrollUserFromCourse,
  updateUserRole,
  deleteUser,
  getUserStats
} = require('../controllers/userManagementController');

// All routes require admin authentication
router.use(protect);
router.use(checkAdmin);

// User statistics
router.get('/stats', getUserStats);

// User management
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

// Course enrollment management
router.post('/:userId/enroll/:courseId', enrollUserInCourse);
router.delete('/:userId/enroll/:courseId', unenrollUserFromCourse);

module.exports = router;

