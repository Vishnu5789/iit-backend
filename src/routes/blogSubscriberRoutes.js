const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  subscribeToBlog,
  getBlogSubscribers,
  getBlogSubscriberStats,
  unsubscribeFromBlog
} = require('../controllers/blogSubscriberController');

// Public routes
router.post('/', subscribeToBlog);
router.post('/unsubscribe', unsubscribeFromBlog);

// Admin routes (protected)
router.get('/stats', protect, checkAdmin, getBlogSubscriberStats);
router.get('/', protect, checkAdmin, getBlogSubscribers);

module.exports = router;

