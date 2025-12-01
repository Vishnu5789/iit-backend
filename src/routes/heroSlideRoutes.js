const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  getHeroSlides,
  getAllHeroSlides,
  getHeroSlide,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderSlides
} = require('../controllers/heroSlideController');

// Public routes
router.get('/', getHeroSlides);
router.get('/:id', getHeroSlide);

// Admin routes
router.get('/admin/all', protect, checkAdmin, getAllHeroSlides);
router.post('/', protect, checkAdmin, createHeroSlide);
router.put('/:id', protect, checkAdmin, updateHeroSlide);
router.delete('/:id', protect, checkAdmin, deleteHeroSlide);
router.post('/reorder', protect, checkAdmin, reorderSlides);

module.exports = router;

