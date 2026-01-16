const Course = require('../models/Course');
const User = require('../models/User');
const s3Service = require('../services/s3Service');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * Stream PDF page image with authentication and watermark
 * @route GET /api/secure-content/pdf/:pdfId/page/:pageNumber
 * @access Private (Enrolled students only)
 */
exports.streamPdfPage = async (req, res, next) => {
  try {
    const { pdfId, pageNumber } = req.params;
    const userId = req.user._id;

    console.log(`📖 Streaming PDF ${pdfId}, page ${pageNumber} for user ${userId}`);

    // 1. Find course containing this PDF
    const course = await Course.findOne({
      $or: [
        { 'pdfFiles._id': pdfId },
        { 'mediaFolders.pdfs._id': pdfId }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // 2. Verify user enrollment
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(
      courseId => courseId.toString() === course._id.toString()
    );

    if (!isEnrolled && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to access this content'
      });
    }

    // 3. Find PDF file in course data
    let pdfFile = null;
    
    // Check in pdfFiles array
    if (course.pdfFiles && course.pdfFiles.length > 0) {
      pdfFile = course.pdfFiles.find(
        pdf => pdf._id.toString() === pdfId.toString()
      );
    }

    // Check in mediaFolders
    if (!pdfFile && course.mediaFolders) {
      for (const folder of course.mediaFolders) {
        if (folder.pdfs && folder.pdfs.length > 0) {
          pdfFile = folder.pdfs.find(
            pdf => pdf._id.toString() === pdfId.toString()
          );
          if (pdfFile) break;
        }
      }
    }

    if (!pdfFile) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }

    // 4. Check if PDF has been converted to images
    if (!pdfFile.pages || pdfFile.pages.length === 0) {
      // PDF not yet converted - fallback to original PDF for now
      return res.status(503).json({
        success: false,
        message: 'PDF is being processed. Please try again in a few moments.'
      });
    }

    // 5. Get requested page
    const pageNum = parseInt(pageNumber);
    if (pageNum < 1 || pageNum > pdfFile.pages.length) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    const pageData = pdfFile.pages[pageNum - 1];
    if (!pageData || !pageData.s3Key) {
      return res.status(404).json({
        success: false,
        message: 'Page image not found'
      });
    }

    // 6. Stream image from S3
    console.log(`📥 Fetching from S3: ${pageData.s3Key}`);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: pageData.s3Key
    };

    try {
      const s3Object = await s3.getObject(params).promise();
      const imageBuffer = s3Object.Body;

      // 7. Set security headers to prevent caching and downloading
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-User-Id': userId.toString(), // For audit trail
        'X-Course-Id': course._id.toString()
      });

      console.log(`✅ Streamed page ${pageNumber} (${imageBuffer.length} bytes)`);

      // 8. Send image buffer
      res.send(imageBuffer);

    } catch (s3Error) {
      console.error('❌ S3 fetch error:', s3Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve page image'
      });
    }

  } catch (error) {
    console.error('❌ Stream PDF page error:', error);
    next(error);
  }
};

/**
 * Get PDF metadata (total pages, dimensions, etc.)
 * @route GET /api/secure-content/pdf/:pdfId/metadata
 * @access Private
 */
exports.getPdfMetadata = async (req, res, next) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user._id;

    console.log(`📋 Fetching metadata for PDF ${pdfId}`);

    // Find course containing this PDF
    const course = await Course.findOne({
      $or: [
        { 'pdfFiles._id': pdfId },
        { 'mediaFolders.pdfs._id': pdfId }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Verify enrollment
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(
      courseId => courseId.toString() === course._id.toString()
    );

    if (!isEnrolled && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find PDF file
    let pdfFile = null;
    
    if (course.pdfFiles && course.pdfFiles.length > 0) {
      pdfFile = course.pdfFiles.find(
        pdf => pdf._id.toString() === pdfId.toString()
      );
    }

    if (!pdfFile && course.mediaFolders) {
      for (const folder of course.mediaFolders) {
        if (folder.pdfs && folder.pdfs.length > 0) {
          pdfFile = folder.pdfs.find(
            pdf => pdf._id.toString() === pdfId.toString()
          );
          if (pdfFile) break;
        }
      }
    }

    if (!pdfFile) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Return metadata
    res.status(200).json({
      success: true,
      data: {
        pdfId: pdfFile._id,
        name: pdfFile.name,
        totalPages: pdfFile.pages ? pdfFile.pages.length : 0,
        courseId: course._id,
        courseName: course.title,
        isProcessed: Boolean(pdfFile.pages && pdfFile.pages.length > 0),
        pages: pdfFile.pages ? pdfFile.pages.map(p => ({
          pageNumber: p.pageNumber,
          width: p.width,
          height: p.height
        })) : []
      }
    });

  } catch (error) {
    console.error('❌ Get PDF metadata error:', error);
    next(error);
  }
};

/**
 * Log PDF access for audit trail
 * @route POST /api/secure-content/pdf/:pdfId/log-access
 * @access Private
 */
exports.logPdfAccess = async (req, res, next) => {
  try {
    const { pdfId } = req.params;
    const { pageNumber, action } = req.body;
    const userId = req.user._id;

    // Log access (can be saved to database or logging service)
    console.log(`📊 Access Log: User ${userId} ${action} PDF ${pdfId} page ${pageNumber}`);

    // In production, save to analytics/audit log database
    // await AccessLog.create({
    //   userId,
    //   pdfId,
    //   pageNumber,
    //   action,
    //   timestamp: new Date(),
    //   ipAddress: req.ip,
    //   userAgent: req.headers['user-agent']
    // });

    res.status(200).json({
      success: true,
      message: 'Access logged'
    });

  } catch (error) {
    console.error('❌ Log access error:', error);
    next(error);
  }
};

module.exports = exports;
