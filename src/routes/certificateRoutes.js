const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  generateCertificate,
  getUserCertificates,
  getCertificate,
  verifyCertificate,
  downloadCertificate,
  getAllCertificates,
  revokeCertificate
} = require('../controllers/certificateController');

// Public routes
router.get('/verify/:certificateNumber', verifyCertificate);

// Protected routes
router.post('/generate/:courseId', protect, generateCertificate);
router.get('/my-certificates', protect, getUserCertificates);
router.get('/:id', protect, getCertificate);
router.get('/:id/download', protect, downloadCertificate);

// Admin routes
router.get('/admin/all', protect, checkAdmin, getAllCertificates);
router.put('/admin/:id/revoke', protect, checkAdmin, revokeCertificate);

module.exports = router;

