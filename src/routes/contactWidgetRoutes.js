const express = require('express');
const router = express.Router();
const contactWidgetController = require('../controllers/contactWidgetController');
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');

// Public route - Get contact widget config
router.get('/', contactWidgetController.getContactWidget);

// Admin routes - Update contact widget config
router.put('/', protect, checkAdmin, contactWidgetController.updateContactWidget);

module.exports = router;

