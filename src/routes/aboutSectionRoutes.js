const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  getAboutSections,
  getAboutSection,
  getAboutSectionsAdmin,
  createAboutSection,
  updateAboutSection,
  deleteAboutSection,
  reorderAboutSections,
  initializeAboutSections
} = require('../controllers/aboutSectionController');

// Public routes
router.get('/', getAboutSections);
router.get('/:id', getAboutSection);

// Admin routes
router.get('/admin/all', protect, checkAdmin, getAboutSectionsAdmin);
router.post('/admin', protect, checkAdmin, createAboutSection);
router.post('/admin/initialize', protect, checkAdmin, initializeAboutSections);
router.post('/admin/reorder', protect, checkAdmin, reorderAboutSections);
router.put('/admin/:id', protect, checkAdmin, updateAboutSection);
router.delete('/admin/:id', protect, checkAdmin, deleteAboutSection);

module.exports = router;


