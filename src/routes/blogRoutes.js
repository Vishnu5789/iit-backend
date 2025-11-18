const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlog);

// Protected admin routes
router.post('/', protect, checkAdmin, createBlog);
router.put('/:id', protect, checkAdmin, updateBlog);
router.delete('/:id', protect, checkAdmin, deleteBlog);

module.exports = router;

