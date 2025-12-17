const ContactConfig = require('../models/ContactConfig');
const ContactMessage = require('../models/ContactMessage');

/**
 * @desc    Get contact configuration
 * @route   GET /api/contact/config
 * @access  Public
 */
const getContactConfig = async (req, res, next) => {
  try {
    // Explicitly set CORS headers to ensure they're present even for cached responses
    const origin = req.headers.origin;
    if (origin) {
      // Check if origin should be allowed (same logic as CORS middleware)
      const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
      const isAllowed = 
        origin.includes('vercel.app') ||
        origin.toLowerCase().includes('isaactechie.com') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:');
      
      if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Expose-Headers', 'ETag, Cache-Control, Content-Type');
        res.setHeader('Vary', 'Origin'); // Important for CORS caching
      }
    }
    
    // Disable caching to prevent 304 responses that might not include CORS headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    let config = await ContactConfig.findOne();
    
    // If no config exists, create default
    if (!config) {
      config = await ContactConfig.create({});
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get contact config error:', error);
    next(error);
  }
};

/**
 * @desc    Update contact configuration
 * @route   PUT /api/contact/config
 * @access  Private (Admin only)
 */
const updateContactConfig = async (req, res, next) => {
  try {
    const updateData = req.body;

    let config = await ContactConfig.findOne();
    
    if (!config) {
      config = await ContactConfig.create(updateData);
    } else {
      config = await ContactConfig.findOneAndUpdate(
        {},
        updateData,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Contact configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update contact config error:', error);
    next(error);
  }
};

/**
 * @desc    Submit contact form
 * @route   POST /api/contact/submit
 * @access  Public
 */
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create contact message
    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message
    });

    // TODO: Send email notification to admin
    // This can be implemented later with nodemailer or SendGrid

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: contactMessage
    });
  } catch (error) {
    console.error('Submit contact form error:', error);
    next(error);
  }
};

/**
 * @desc    Get all contact messages
 * @route   GET /api/contact/messages
 * @access  Private (Admin only)
 */
const getContactMessages = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(query);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: messages
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    next(error);
  }
};

/**
 * @desc    Get single contact message
 * @route   GET /api/contact/messages/:id
 * @access  Private (Admin only)
 */
const getContactMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Mark as read if it's new
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    next(error);
  }
};

/**
 * @desc    Update contact message status
 * @route   PUT /api/contact/messages/:id
 * @access  Private (Admin only)
 */
const updateMessageStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Update message status error:', error);
    next(error);
  }
};

/**
 * @desc    Delete contact message
 * @route   DELETE /api/contact/messages/:id
 * @access  Private (Admin only)
 */
const deleteContactMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    next(error);
  }
};

/**
 * @desc    Get contact statistics
 * @route   GET /api/contact/stats
 * @access  Private (Admin only)
 */
const getContactStats = async (req, res, next) => {
  try {
    const totalMessages = await ContactMessage.countDocuments();
    const newMessages = await ContactMessage.countDocuments({ status: 'new' });
    const readMessages = await ContactMessage.countDocuments({ status: 'read' });
    const repliedMessages = await ContactMessage.countDocuments({ status: 'replied' });
    const archivedMessages = await ContactMessage.countDocuments({ status: 'archived' });

    const recentMessages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalMessages,
        newMessages,
        readMessages,
        repliedMessages,
        archivedMessages,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    next(error);
  }
};

module.exports = {
  getContactConfig,
  updateContactConfig,
  submitContactForm,
  getContactMessages,
  getContactMessage,
  updateMessageStatus,
  deleteContactMessage,
  getContactStats
};

