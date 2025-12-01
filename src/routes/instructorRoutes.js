const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');

// Public routes
router.get('/', instructorController.getInstructors);
router.get('/:id', instructorController.getInstructor);

// Admin routes
router.get('/admin/all', protect, checkAdmin, instructorController.getAllInstructorsAdmin);
router.post('/', protect, checkAdmin, instructorController.createInstructor);
router.put('/:id', protect, checkAdmin, instructorController.updateInstructor);
router.delete('/:id', protect, checkAdmin, instructorController.deleteInstructor);
router.put('/admin/reorder', protect, checkAdmin, instructorController.reorderInstructors);

module.exports = router;

