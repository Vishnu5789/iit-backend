const Cart = require('../models/Cart');
const Course = require('../models/Course');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.course', 'title description thumbnail price discountPrice duration level category');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if course already in cart
    const existingItem = cart.items.find(item => 
      item.course.toString() === courseId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Course already in cart'
      });
    }

    // Add item to cart
    cart.items.push({
      course: courseId,
      price: course.price,
      discountPrice: course.discountPrice
    });

    await cart.save();

    // Populate and return
    cart = await Cart.findById(cart._id)
      .populate('items.course', 'title description thumbnail price discountPrice duration level category');

    res.status(200).json({
      success: true,
      message: 'Course added to cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove/:courseId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    cart.items = cart.items.filter(item => 
      item.course.toString() !== courseId
    );

    await cart.save();

    // Populate and return
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.course', 'title description thumbnail price discountPrice duration level category');

    res.status(200).json({
      success: true,
      message: 'Course removed from cart',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};

