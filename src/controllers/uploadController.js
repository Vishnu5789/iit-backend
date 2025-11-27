const { s3Client, bucketName, bucketUrl } = require('../config/s3');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit (supports 1-hour videos and large PDFs)
  }
});

/**
 * Generate unique filename
 */
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  return `${nameWithoutExt}-${timestamp}-${randomString}${extension}`;
};

/**
 * Get file MIME type based on extension
 */
const getContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * @desc    Upload file to AWS S3
 * @route   POST /api/upload
 * @access  Private (Admin only)
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!s3Client || !bucketName) {
      return res.status(503).json({
        success: false,
        message: 'AWS S3 is not configured. Please add AWS credentials to enable file uploads.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { folder = 'courses' } = req.body;
    
    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(req.file.originalname);
    const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
    
    // Get content type
    const contentType = getContentType(req.file.originalname);

    // Upload to S3 using parallelized upload for better performance
    const parallelUploads3 = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: req.file.buffer,
        ContentType: contentType,
        // Note: Public access is controlled by bucket policy, not ACL
        // ACL removed as modern S3 buckets have ACLs disabled by default
      },
      // Optional: Configure multipart upload
      queueSize: 4, // concurrent uploads
      partSize: 1024 * 1024 * 5, // 5MB per part
    });

    // Track upload progress (optional)
    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
    });

    const result = await parallelUploads3.done();

    // Generate public URL (for buckets with public read policy)
    const fileUrl = `${bucketUrl}/${key}`;

    // Define which folders are public (no presigned URL needed)
    const publicFolders = ['courses', 'homepage', 'about', 'team', 'course-syllabuses', 'blog', 'industries'];
    const isPublicFolder = publicFolders.some(pubFolder => folder.startsWith(pubFolder));

    // For public folders, just return the public URL
    // For private folders (videos, materials), generate presigned URL
    let presignedUrl = null;
    if (!isPublicFolder) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl, // Public URL (for public folders this is all you need)
        presignedUrl: presignedUrl, // Only set for private folders
        fileId: key, // S3 key serves as fileId
        name: uniqueFileName,
        fileType: contentType,
        size: req.file.size,
        bucket: bucketName,
        key: key
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
 * @desc    Delete file from AWS S3
 * @route   DELETE /api/upload/:fileId
 * @access  Private (Admin only)
 */
const deleteFile = async (req, res, next) => {
  try {
    if (!s3Client || !bucketName) {
      return res.status(503).json({
        success: false,
        message: 'AWS S3 is not configured. Please add AWS credentials to enable file management.'
      });
    }

    // The fileId is the S3 key (full path)
    const { fileId } = req.params;

    // Decode the fileId in case it's URL encoded
    const key = decodeURIComponent(fileId);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);

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
 * @desc    Get AWS S3 configuration info (not authentication params like ImageKit)
 * @route   GET /api/upload/auth
 * @access  Private (Admin only)
 */
const getAuthParams = async (req, res, next) => {
  try {
    if (!s3Client || !bucketName) {
      return res.status(503).json({
        success: false,
        message: 'AWS S3 is not configured. Please add AWS credentials to enable file uploads.'
      });
    }

    // For S3, we don't need to return authentication parameters
    // since uploads are handled server-side
    res.status(200).json({
      success: true,
      message: 'S3 is configured and ready',
      data: {
        configured: true,
        bucketName: bucketName,
        region: process.env.AWS_REGION
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get S3 configuration'
    });
  }
};

/**
 * @desc    Generate presigned URL for direct upload (bypasses server)
 * @route   POST /api/upload/presigned-upload
 * @access  Private (authenticated users only)
 */
const getPresignedUploadUrl = async (req, res, next) => {
  try {
    if (!s3Client || !bucketName) {
      return res.status(503).json({
        success: false,
        message: 'AWS S3 is not configured.'
      });
    }

    const { filename, folder = 'uploads', contentType } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFileName(filename);
    const key = `${folder}/${uniqueFilename}`;

    // Determine content type
    const fileContentType = contentType || getContentType(filename);

    // Create PutObjectCommand for upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileContentType
    });

    // Generate presigned URL for upload (valid for 1 hour)
    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 
    });

    res.status(200).json({
      success: true,
      data: {
        uploadUrl: presignedUrl,
        key: key,
        url: `${bucketUrl}/${key}`, // Final URL after upload
        fileId: key,
        expiresIn: 3600
      }
    });
  } catch (error) {
    console.error('Presigned upload URL generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate presigned upload URL',
      error: error.message
    });
  }
};

/**
 * @desc    Generate presigned URL for downloading a file
 * @route   GET /api/upload/presigned/:fileId
 * @access  Public (anyone can get presigned URL for existing files)
 */
const getPresignedUrl = async (req, res, next) => {
  try {
    if (!s3Client || !bucketName) {
      return res.status(503).json({
        success: false,
        message: 'AWS S3 is not configured.'
      });
    }

    const { fileId } = req.params;
    const { expiresIn = 3600 } = req.query; // Default 1 hour

    // Decode the fileId in case it's URL encoded
    const key = decodeURIComponent(fileId);

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: parseInt(expiresIn) 
    });

    res.status(200).json({
      success: true,
      data: {
        presignedUrl: presignedUrl,
        expiresIn: expiresIn,
        key: key
      }
    });
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate presigned URL',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  deleteFile,
  getAuthParams,
  getPresignedUrl,
  getPresignedUploadUrl
};
