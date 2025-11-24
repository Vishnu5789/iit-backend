const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  getContactConfig,
  updateContactConfig,
  submitContactForm,
  getContactMessages,
  getContactMessage,
  updateMessageStatus,
  deleteContactMessage,
  getContactStats
} = require('../controllers/contactController');

// Public routes
router.get('/config', getContactConfig);
router.post('/submit', submitContactForm);

// Admin routes (protected)
router.put('/config', protect, checkAdmin, updateContactConfig);
router.get('/stats', protect, checkAdmin, getContactStats);
router.get('/messages', protect, checkAdmin, getContactMessages);
router.get('/messages/:id', protect, checkAdmin, getContactMessage);
router.put('/messages/:id', protect, checkAdmin, updateMessageStatus);
router.delete('/messages/:id', protect, checkAdmin, deleteContactMessage);

module.exports = router;

