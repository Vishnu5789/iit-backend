const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:courseId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;

