const WebinarConfig = require('../models/WebinarConfig');

/**
 * @desc    Get webinar configuration
 * @route   GET /api/webinar/config
 * @access  Public
 */
const getWebinarConfig = async (req, res, next) => {
  try {
    let config = await WebinarConfig.findOne();
    
    // If no config exists, create default with required fields
    if (!config) {
      // Create with default zoom link (admin must update it)
      config = await WebinarConfig.create({
        zoomLink: 'https://zoom.us/j/1234567890' // Placeholder, admin must update
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get webinar config error:', error);
    next(error);
  }
};

/**
 * @desc    Update webinar configuration
 * @route   PUT /api/webinar/config
 * @access  Private (Admin only)
 */
const updateWebinarConfig = async (req, res, next) => {
  try {
    const updateData = req.body;

    // Validate zoomLink is provided
    if (!updateData.zoomLink || updateData.zoomLink.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Zoom link is required'
      });
    }

    // Validate interestAreas is an array with at least one item
    if (updateData.interestAreas && (!Array.isArray(updateData.interestAreas) || updateData.interestAreas.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one interest area must be configured'
      });
    }

    let config = await WebinarConfig.findOne();
    
    if (!config) {
      config = await WebinarConfig.create(updateData);
    } else {
      config = await WebinarConfig.findOneAndUpdate(
        {},
        updateData,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Webinar configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update webinar config error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next(error);
  }
};

module.exports = {
  getWebinarConfig,
  updateWebinarConfig
};

