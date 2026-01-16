const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const secureContentController = require('../controllers/secureContentController');

/**
 * Secure Content Routes
 * All routes require authentication via JWT token
 */

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   GET /api/secure-content/pdf/:pdfId/metadata
 * @desc    Get PDF metadata (total pages, dimensions)
 * @access  Private (Enrolled students + Admin)
 */
router.get('/pdf/:pdfId/metadata', secureContentController.getPdfMetadata);

/**
 * @route   GET /api/secure-content/pdf/:pdfId/page/:pageNumber
 * @desc    Stream single PDF page as image
 * @access  Private (Enrolled students + Admin)
 */
router.get('/pdf/:pdfId/page/:pageNumber', secureContentController.streamPdfPage);

/**
 * @route   POST /api/secure-content/pdf/:pdfId/log-access
 * @desc    Log PDF access for audit trail
 * @access  Private
 */
router.post('/pdf/:pdfId/log-access', secureContentController.logPdfAccess);

module.exports = router;
