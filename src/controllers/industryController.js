const Industry = require('../models/Industry');

/**
 * @desc    Get all industries
 * @route   GET /api/industries
 * @access  Public
 */
const getIndustries = async (req, res, next) => {
  try {
    const industries = await Industry.find({ isActive: true })
      .sort({ order: 1 })
      .populate('createdBy', 'fullName email');

    res.status(200).json({
      success: true,
      count: industries.length,
      data: industries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single industry
 * @route   GET /api/industries/:id
 * @access  Public
 */
const getIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: 'Industry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: industry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create industry
 * @route   POST /api/industries
 * @access  Private (Admin only)
 */
const createIndustry = async (req, res, next) => {
  try {
    // Add user ID to req.body
    req.body.createdBy = req.user.id;

    const industry = await Industry.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Industry created successfully',
      data: industry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update industry
 * @route   PUT /api/industries/:id
 * @access  Private (Admin only)
 */
const updateIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: 'Industry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Industry updated successfully',
      data: industry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete industry
 * @route   DELETE /api/industries/:id
 * @access  Private (Admin only)
 */
const deleteIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findByIdAndDelete(req.params.id);

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: 'Industry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Industry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIndustries,
  getIndustry,
  createIndustry,
  updateIndustry,
  deleteIndustry
};

