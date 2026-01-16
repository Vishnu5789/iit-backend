const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const resourceController = require('../controllers/resourceController');

// Public routes
router.get('/', resourceController.getResources);
router.get('/:id', resourceController.getResource);

// Protected routes (require authentication)
router.use(protect);
router.get('/:id/access', resourceController.checkAccess);
router.post('/:id/download', resourceController.downloadResource);

// Admin routes
router.post('/', checkAdmin, resourceController.createResource);
router.put('/:id', checkAdmin, resourceController.updateResource);
router.delete('/:id', checkAdmin, resourceController.deleteResource);
router.get('/admin/stats', checkAdmin, resourceController.getResourceStats);

module.exports = router;
