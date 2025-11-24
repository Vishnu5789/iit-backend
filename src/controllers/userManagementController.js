const User = require('../models/User');
const Course = require('../models/Course');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .populate('enrolledCourses', 'title thumbnail price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses', 'title thumbnail price duration level category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    next(error);
  }
};

/**
 * @desc    Manually enroll user in course
 * @route   POST /api/admin/users/:userId/enroll/:courseId
 * @access  Private (Admin only)
 */
const enrollUserInCourse = async (req, res, next) => {
  try {
    const { userId, courseId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already enrolled in this course'
      });
    }

    // Enroll user
    user.enrolledCourses.push(courseId);
    await user.save();

    // Populate and return updated user
    const updatedUser = await User.findById(userId)
      .select('-password')
      .populate('enrolledCourses', 'title thumbnail price');

    res.status(200).json({
      success: true,
      message: `User enrolled in ${course.title} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Enroll user error:', error);
    next(error);
  }
};

/**
 * @desc    Manually unenroll user from course
 * @route   DELETE /api/admin/users/:userId/enroll/:courseId
 * @access  Private (Admin only)
 */
const unenrollUserFromCourse = async (req, res, next) => {
  try {
    const { userId, courseId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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

    // Check if enrolled
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not enrolled in this course'
      });
    }

    // Unenroll user
    user.enrolledCourses = user.enrolledCourses.filter(
      id => id.toString() !== courseId
    );
    await user.save();

    // Populate and return updated user
    const updatedUser = await User.findById(userId)
      .select('-password')
      .populate('enrolledCourses', 'title thumbnail price');

    res.status(200).json({
      success: true,
      message: `User unenrolled from ${course.title} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Unenroll user error:', error);
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, instructor, or admin'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/admin/users/stats
 * @access  Private (Admin only)
 */
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .select('fullName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        usersByRole,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  enrollUserInCourse,
  unenrollUserFromCourse,
  updateUserRole,
  deleteUser,
  getUserStats
};

