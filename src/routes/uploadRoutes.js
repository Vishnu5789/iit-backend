const express = require('express');
const router = express.Router();
const {
  upload,
  uploadFile,
  deleteFile,
  getAuthParams
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');

// All routes require authentication and admin privileges
router.post('/', protect, checkAdmin, upload.single('file'), uploadFile);
router.delete('/:fileId', protect, checkAdmin, deleteFile);
router.get('/auth', protect, checkAdmin, getAuthParams);

module.exports = router;

