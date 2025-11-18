const express = require('express');
const router = express.Router();
const {
  getIndustries,
  getIndustry,
  createIndustry,
  updateIndustry,
  deleteIndustry
} = require('../controllers/industryController');
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');

// Public routes
router.get('/', getIndustries);
router.get('/:id', getIndustry);

// Protected admin routes
router.post('/', protect, checkAdmin, createIndustry);
router.put('/:id', protect, checkAdmin, updateIndustry);
router.delete('/:id', protect, checkAdmin, deleteIndustry);

module.exports = router;

