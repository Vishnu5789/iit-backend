const User = require('../models/User');
const Course = require('../models/Course');

/**
 * @desc    Get user's enrolled courses
 * @route   GET /api/enrollments/my-courses
 * @access  Private
 */
const getEnrolledCourses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses',
        select: 'title description thumbnail duration level category price discountPrice createdAt'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    next(error);
  }
};

/**
 * @desc    Check if user is enrolled in a course
 * @route   GET /api/enrollments/check/:courseId
 * @access  Private
 */
const checkEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isEnrolled = user.enrolledCourses.includes(courseId);

    res.status(200).json({
      success: true,
      data: {
        isEnrolled
      }
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    next(error);
  }
};

/**
 * @desc    Get course content for enrolled users
 * @route   GET /api/enrollments/course/:courseId/content
 * @access  Private (must be enrolled)
 */
const getCourseContent = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if user is enrolled
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isEnrolled = user.enrolledCourses.includes(courseId);

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must purchase this course to access its content'
      });
    }

    // Get full course with all materials
    const course = await Course.findById(courseId)
      .select('title description thumbnail duration level category videoFiles pdfFiles images sampleVideos');

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
    console.error('Get course content error:', error);
    next(error);
  }
};

/**
 * @desc    Admin self-enrollment (no payment required)
 * @route   POST /api/enrollments/admin-enroll/:courseId
 * @access  Private (Admin only)
 */
const adminSelfEnroll = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can use this endpoint'
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

    // Check if already enrolled
    const user = await User.findById(req.user._id);
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Enroll admin in course
    user.enrolledCourses.push(courseId);
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully enrolled in ${course.title}`,
      data: {
        courseId: course._id,
        courseTitle: course.title
      }
    });
  } catch (error) {
    console.error('Admin self-enroll error:', error);
    next(error);
  }
};

module.exports = {
  getEnrolledCourses,
  checkEnrollment,
  getCourseContent,
  adminSelfEnroll
};

