const BlogSubscriber = require('../models/BlogSubscriber');
const crypto = require('crypto');

/**
 * @desc    Subscribe to blog newsletter
 * @route   POST /api/blog-subscribers
 * @access  Public
 */
const subscribeToBlog = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if already subscribed
    const existingSubscriber = await BlogSubscriber.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribeToken = crypto.randomBytes(32).toString('hex');
        await existingSubscriber.save();

        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to our newsletter!',
          data: existingSubscriber
        });
      }
    }

    // Create new subscription
    const subscriber = await BlogSubscriber.create({
      email: email.toLowerCase().trim(),
      unsubscribeToken: crypto.randomBytes(32).toString('hex')
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
      data: subscriber
    });
  } catch (error) {
    console.error('Subscribe to blog error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter'
      });
    }

    next(error);
  }
};

/**
 * @desc    Get all blog subscribers (Admin only)
 * @route   GET /api/blog-subscribers
 * @access  Private (Admin)
 */
const getBlogSubscribers = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const subscribers = await BlogSubscriber.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v -unsubscribeToken');

    const total = await BlogSubscriber.countDocuments(query);

    res.status(200).json({
      success: true,
      data: subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get blog subscribers error:', error);
    next(error);
  }
};

/**
 * @desc    Get blog subscriber statistics (Admin only)
 * @route   GET /api/blog-subscribers/stats
 * @access  Private (Admin)
 */
const getBlogSubscriberStats = async (req, res, next) => {
  try {
    const total = await BlogSubscriber.countDocuments();
    const active = await BlogSubscriber.countDocuments({ isActive: true });
    const inactive = await BlogSubscriber.countDocuments({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive
      }
    });
  } catch (error) {
    console.error('Get blog subscriber stats error:', error);
    next(error);
  }
};

/**
 * @desc    Unsubscribe from blog newsletter
 * @route   POST /api/blog-subscribers/unsubscribe
 * @access  Public
 */
const unsubscribeFromBlog = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await BlogSubscriber.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    // Verify token if provided
    if (token && subscriber.unsubscribeToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unsubscribe token'
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Unsubscribe from blog error:', error);
    next(error);
  }
};

module.exports = {
  subscribeToBlog,
  getBlogSubscribers,
  getBlogSubscriberStats,
  unsubscribeFromBlog
};

