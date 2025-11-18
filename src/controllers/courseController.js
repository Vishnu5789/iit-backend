const Course = require('../models/Course');

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single course
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create course
 * @route   POST /api/courses
 * @access  Private (Admin only)
 */
const createCourse = async (req, res, next) => {
  try {
    // Add user ID to req.body
    req.body.createdBy = req.user.id;

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Admin only)
 */
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin only)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
};

