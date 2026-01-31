const Course = require('../models/Course');

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = async (req, res, next) => {
  try {
    // Check if only titles are requested (for dropdowns)
    const { titlesOnly } = req.query;
    
    if (titlesOnly === 'true') {
      const courses = await Course.find({ isActive: true })
        .select('title _id')
        .sort({ title: 1 });
      
      return res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    }
    
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

    // Validate syllabus: at least one format (PDF or text) must be provided
    const hasPdfSyllabus = req.body.syllabus?.url;
    const hasTextSyllabus = req.body.syllabusText?.trim();
    
    if (!hasPdfSyllabus && !hasTextSyllabus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course syllabus in PDF format, text format, or both'
      });
    }

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

/**
 * @desc    Get public statistics for a course
 * @route   GET /api/courses/:id/stats
 * @access  Public
 */
const getCoursePublicStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment count
    const User = require('../models/User');
    const enrollmentCount = await User.countDocuments({
      enrolledCourses: id
    });

    // Get recent enrollments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEnrollments = await User.countDocuments({
      enrolledCourses: id,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Determine popularity badge
    let popularityBadge = null;
    if (recentEnrollments >= 10) popularityBadge = 'Trending';
    if (enrollmentCount >= 100) popularityBadge = 'Bestseller';
    
    const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
    const isNew = new Date(course.createdAt) > thirtyDaysAgo;
    if (isNew && !popularityBadge) popularityBadge = 'New';

    res.status(200).json({
      success: true,
      data: {
        enrollmentCount,
        recentEnrollments,
        averageRating: course.averageRating || 0,
        totalReviews: course.totalReviews || 0,
        popularityBadge,
        lastUpdated: course.updatedAt,
        completionRate: 0, // Implement based on your progress tracking
        level: course.level,
        duration: course.duration
      }
    });

  } catch (error) {
    console.error('Get public stats error:', error);
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursePublicStats
};

