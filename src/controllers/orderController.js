const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Course = require('../models/Course');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
} else {
  console.warn('⚠️  Razorpay credentials not configured. Payment features will be disabled.');
}

/**
 * @desc    Create Razorpay order
 * @route   POST /api/orders/create-razorpay-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured'
      });
    }

    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: razorpayOrder
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/orders/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
};

/**
 * @desc    Create order after successful payment
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, payment } = req.body;

    // Validate required fields
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.course');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Generate unique order number
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      courses: cart.items.map(item => ({
        course: item.course._id,
        price: item.price,
        discountPrice: item.discountPrice,
        finalPrice: item.discountPrice > 0 ? item.discountPrice : item.price
      })),
      shippingAddress,
      payment: {
        ...payment,
        status: payment?.status || 'completed',
        paidAt: payment?.status === 'completed' ? new Date() : null
      },
      totalPrice: cart.totalPrice,
      totalDiscount: cart.totalDiscount,
      finalPrice: cart.finalPrice,
      status: 'processing'
    });

    // Enroll user in purchased courses
    const courseIds = cart.items.map(item => item.course._id);
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { enrolledCourses: { $each: courseIds } } }
    );

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('courses.course', 'title description thumbnail duration level category');

    res.status(201).json({
      success: true,
      message: 'Order created successfully. You can now access your courses.',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    next(error);
  }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('courses.course', 'title description thumbnail duration level category')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('courses.course', 'title description thumbnail duration level category videoFiles pdfFiles');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user (or user is admin)
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin/all
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('courses.course', 'title description thumbnail')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('courses.course', 'title description thumbnail');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  createOrder,
  getOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
};

