const imagekit = require('../config/imagekit');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

/**
 * @desc    Upload file to ImageKit
 * @route   POST /api/upload
 * @access  Private (Admin only)
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!imagekit) {
      return res.status(503).json({
        success: false,
        message: 'ImageKit is not configured. Please add ImageKit credentials to enable file uploads.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { folder = 'courses' } = req.body;
    
    // Upload to ImageKit
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: folder,
      useUniqueFileName: true
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        fileType: result.fileType,
        size: result.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

/**
 * @desc    Delete file from ImageKit
 * @route   DELETE /api/upload/:fileId
 * @access  Private (Admin only)
 */
const deleteFile = async (req, res, next) => {
  try {
    if (!imagekit) {
      return res.status(503).json({
        success: false,
        message: 'ImageKit is not configured. Please add ImageKit credentials to enable file management.'
      });
    }

    const { fileId } = req.params;

    await imagekit.deleteFile(fileId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get ImageKit authentication parameters
 * @route   GET /api/upload/auth
 * @access  Private (Admin only)
 */
const getAuthParams = async (req, res, next) => {
  try {
    if (!imagekit) {
      return res.status(503).json({
        success: false,
        message: 'ImageKit is not configured. Please add ImageKit credentials to enable file uploads.'
      });
    }

    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    res.status(200).json({
      success: true,
      data: authenticationParameters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get authentication parameters'
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  deleteFile,
  getAuthParams
};

