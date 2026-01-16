const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Get comprehensive statistics for a specific course
 * @route GET /api/stats/course/:courseId
 * @access Private (Admin only)
 */
exports.getCourseStats = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Verify admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Admin only'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log(`📊 Fetching statistics for course: ${course.title}`);

    // 1. Total enrolled users
    const enrolledUsers = await User.find({
      enrolledCourses: courseId
    }).select('fullName email createdAt').sort('-createdAt');

    const totalEnrolled = enrolledUsers.length;

    // 2. Revenue statistics
    const orders = await Order.find({
      'items.course': courseId,
      status: 'completed'
    });

    const totalRevenue = orders.reduce((sum, order) => {
      const courseItem = order.items.find(item => 
        item.course && item.course.toString() === courseId.toString()
      );
      return sum + (courseItem ? courseItem.price : 0);
    }, 0);

    // 3. Enrollment trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnrollments = enrolledUsers.filter(user => 
      new Date(user.createdAt) >= thirtyDaysAgo
    ).length;

    // 4. Completion rate (placeholder)
    const completionRate = 0;

    // 5. Average rating
    const avgRating = course.averageRating || 0;
    const totalReviews = course.totalReviews || 0;

    // 6. Content statistics
    const contentStats = {
      videos: course.videoFiles?.length || 0,
      pdfs: course.pdfFiles?.length || 0,
      images: course.images?.length || 0,
      textSections: course.textContent?.length || 0,
      mediaFolders: course.mediaFolders?.length || 0,
      sampleVideos: course.sampleVideos?.length || 0
    };

    // 7. Enrollment by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentsByMonth = {};
    enrolledUsers.forEach(user => {
      const month = new Date(user.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      enrollmentsByMonth[month] = (enrollmentsByMonth[month] || 0) + 1;
    });

    console.log(`✓ Stats fetched: ${totalEnrolled} students, ₹${totalRevenue} revenue`);

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          category: course.category,
          level: course.level,
          price: course.price,
          discountPrice: course.discountPrice,
          thumbnail: course.thumbnail
        },
        enrollment: {
          total: totalEnrolled,
          recent30Days: recentEnrollments,
          byMonth: enrollmentsByMonth,
          students: enrolledUsers.map(user => ({
            id: user._id,
            name: user.fullName,
            email: user.email,
            enrolledAt: user.createdAt
          }))
        },
        revenue: {
          total: totalRevenue,
          perStudent: totalEnrolled > 0 ? Math.round(totalRevenue / totalEnrolled) : 0,
          orders: orders.length
        },
        performance: {
          completionRate,
          avgRating,
          totalReviews
        },
        content: contentStats
      }
    });

  } catch (error) {
    console.error('❌ Get course stats error:', error);
    next(error);
  }
};

/**
 * Get statistics for all courses
 * @route GET /api/stats/courses
 * @access Private (Admin only)
 */
exports.getAllCoursesStats = async (req, res, next) => {
  try {
    // Verify admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Admin only'
      });
    }

    console.log('📊 Fetching statistics for all courses...');

    const courses = await Course.find().select('title category level price discountPrice thumbnail');
    
    const stats = await Promise.all(
      courses.map(async (course) => {
        const enrolledCount = await User.countDocuments({
          enrolledCourses: course._id
        });

        const orders = await Order.find({
          'items.course': course._id,
          status: 'completed'
        });

        const revenue = orders.reduce((sum, order) => {
          const courseItem = order.items.find(item => 
            item.course && item.course.toString() === course._id.toString()
          );
          return sum + (courseItem ? courseItem.price : 0);
        }, 0);

        return {
          id: course._id,
          title: course.title,
          category: course.category,
          level: course.level,
          price: course.price,
          discountPrice: course.discountPrice,
          thumbnail: course.thumbnail,
          enrolledStudents: enrolledCount,
          revenue,
          revenuePerStudent: enrolledCount > 0 ? Math.round(revenue / enrolledCount) : 0
        };
      })
    );

    // Sort by enrollment count
    stats.sort((a, b) => b.enrolledStudents - a.enrolledStudents);

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRevenue = stats.reduce((sum, course) => sum + course.revenue, 0);

    console.log(`✓ All stats fetched: ${courses.length} courses, ${totalStudents} students, ₹${totalRevenue} revenue`);

    res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents,
        totalRevenue,
        totalEnrollments: stats.reduce((sum, c) => sum + c.enrolledStudents, 0),
        courses: stats
      }
    });

  } catch (error) {
    console.error('❌ Get all courses stats error:', error);
    next(error);
  }
};

/**
 * Get dashboard summary
 * @route GET /api/stats/dashboard
 * @access Private (Admin only)
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    // Verify admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Admin only'
      });
    }

    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Total enrollments
    const users = await User.find({ role: 'student' }).select('enrolledCourses');
    const totalEnrollments = users.reduce((sum, user) => sum + user.enrolledCourses.length, 0);

    // Recent orders
    const recentOrders = await Order.find({ status: 'completed' })
      .sort('-createdAt')
      .limit(10)
      .populate('user', 'fullName email')
      .populate('items.course', 'title');

    // Total revenue
    const orders = await Order.find({ status: 'completed' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Recent enrollments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEnrollments = users.filter(user => 
      new Date(user.createdAt) >= sevenDaysAgo
    ).length;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCourses,
          totalStudents,
          totalAdmins,
          totalEnrollments,
          totalRevenue,
          recentEnrollments
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          user: order.user,
          amount: order.totalAmount,
          courses: order.items.map(item => item.course?.title),
          date: order.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get dashboard summary error:', error);
    next(error);
  }
};

module.exports = exports;
