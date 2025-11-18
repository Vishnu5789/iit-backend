const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth');
const {
  createRazorpayOrder,
  verifyPayment,
  createOrder,
  getOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// All order routes require authentication
router.use(protect);

// Admin routes (must be before /:id routes)
router.get('/admin/all', checkAdmin, getAllOrders);
router.put('/:id/status', checkAdmin, updateOrderStatus);

// User routes
router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);

module.exports = router;

