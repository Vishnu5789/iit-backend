const HomeConfig = require('../models/HomeConfig');

/**
 * @desc    Get homepage configuration
 * @route   GET /api/home-config
 * @access  Public
 */
const getHomeConfig = async (req, res, next) => {
  try {
    let config = await HomeConfig.findOne();
    
    // If no config exists, create default
    if (!config) {
      config = await HomeConfig.create({
        heroImage: {
          url: '/assets/hero.svg',
          fileId: ''
        },
        starsImage: {
          url: '/assets/stars.svg',
          fileId: ''
        },
        visionImage: {
          url: '/assets/vision.svg',
          fileId: ''
        },
        teamCollaborationImage: {
          url: '/assets/team-collaboration.svg',
          fileId: ''
        },
        goalsImage: {
          url: '/assets/goals.svg',
          fileId: ''
        },
        journeyImage: {
          url: '/assets/journey.svg',
          fileId: ''
        }
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get home config error:', error);
    next(error);
  }
};

/**
 * @desc    Update homepage configuration
 * @route   PUT /api/home-config
 * @access  Private (Admin only)
 */
const updateHomeConfig = async (req, res, next) => {
  try {
    const updateData = req.body;

    let config = await HomeConfig.findOne();
    
    if (!config) {
      config = await HomeConfig.create(updateData);
    } else {
      config = await HomeConfig.findOneAndUpdate(
        {},
        updateData,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Homepage configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update home config error:', error);
    next(error);
  }
};

/**
 * @desc    Update homepage image
 * @route   PUT /api/home-config/image/:imageType
 * @access  Private (Admin only)
 */
const updateHomeImage = async (req, res, next) => {
  try {
    const { imageType } = req.params;
    const { url, fileId } = req.body;

    const validImageTypes = ['heroImage', 'starsImage', 'visionImage', 'teamCollaborationImage', 'goalsImage', 'journeyImage'];
    
    if (!validImageTypes.includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type'
      });
    }

    let config = await HomeConfig.findOne();
    
    if (!config) {
      config = await HomeConfig.create({});
    }

    config[imageType] = { url, fileId };
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update home image error:', error);
    next(error);
  }
};

/**
 * @desc    Update homepage stats
 * @route   PUT /api/home-config/stats
 * @access  Private (Admin only)
 */
const updateHomeStats = async (req, res, next) => {
  try {
    const { studentsCount, coursesCount, averageRating } = req.body;

    let config = await HomeConfig.findOne();
    
    if (!config) {
      config = await HomeConfig.create({});
    }

    if (studentsCount) config.stats.studentsCount = studentsCount;
    if (coursesCount) config.stats.coursesCount = coursesCount;
    if (averageRating) config.stats.averageRating = averageRating;

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Stats updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update home stats error:', error);
    next(error);
  }
};

/**
 * @desc    Update homepage hero text
 * @route   PUT /api/home-config/hero-text
 * @access  Private (Admin only)
 */
const updateHeroText = async (req, res, next) => {
  try {
    const { badge, headline, description } = req.body;

    let config = await HomeConfig.findOne();
    
    if (!config) {
      config = await HomeConfig.create({});
    }

    if (badge) config.heroText.badge = badge;
    if (headline) config.heroText.headline = headline;
    if (description) config.heroText.description = description;

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Hero text updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update hero text error:', error);
    next(error);
  }
};

module.exports = {
  getHomeConfig,
  updateHomeConfig,
  updateHomeImage,
  updateHomeStats,
  updateHeroText
};

