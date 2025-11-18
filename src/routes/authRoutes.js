const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateSignup,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');

// Public routes
router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

