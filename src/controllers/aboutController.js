const AboutConfig = require('../models/AboutConfig');

/**
 * @desc    Get about page configuration
 * @route   GET /api/about/config
 * @access  Public
 */
const getAboutConfig = async (req, res, next) => {
  try {
    let config = await AboutConfig.findOne();
    
    // If no config exists, create default
    if (!config) {
      config = await AboutConfig.create({});
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get about config error:', error);
    next(error);
  }
};

/**
 * @desc    Update about page configuration
 * @route   PUT /api/about/config
 * @access  Private (Admin only)
 */
const updateAboutConfig = async (req, res, next) => {
  try {
    const updateData = req.body;

    let config = await AboutConfig.findOne();
    
    if (!config) {
      config = await AboutConfig.create(updateData);
    } else {
      config = await AboutConfig.findOneAndUpdate(
        {},
        updateData,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'About configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update about config error:', error);
    next(error);
  }
};

module.exports = {
  getAboutConfig,
  updateAboutConfig
};

