const express = require('express');
const router = express.Router();
const {
  upload,
  uploadFile,
  deleteFile,
  getAuthParams,
  getPresignedUrl
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');

// Upload and delete require authentication and admin privileges
router.post('/', protect, checkAdmin, upload.single('file'), uploadFile);
router.delete('/:fileId', protect, checkAdmin, deleteFile);

// Presigned URL can be accessed publicly (for viewing files)
router.get('/presigned/:fileId', getPresignedUrl);
router.get('/auth', protect, checkAdmin, getAuthParams);

module.exports = router;

