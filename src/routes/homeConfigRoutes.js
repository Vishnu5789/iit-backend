const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  getHomeConfig,
  updateHomeConfig,
  updateHomeImage,
  updateHomeStats,
  updateHeroText
} = require('../controllers/homeConfigController');

// Public route
router.get('/', getHomeConfig);

// Admin routes (protected)
router.put('/', protect, checkAdmin, updateHomeConfig);
router.put('/image/:imageType', protect, checkAdmin, updateHomeImage);
router.put('/stats', protect, checkAdmin, updateHomeStats);
router.put('/hero-text', protect, checkAdmin, updateHeroText);

module.exports = router;

