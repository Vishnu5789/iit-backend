const Instructor = require('../models/Instructor');
const User = require('../models/User');

// Get all instructors (public)
exports.getInstructors = async (req, res) => {
  try {
    // Get instructors from Instructor collection
    const instructors = await Instructor.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-createdBy');
    
    // Get users with instructor role
    const instructorUsers = await User.find({ role: 'instructor' })
      .select('fullName email profileImage bio createdAt');
    
    // Transform user data to match instructor format
    const transformedUsers = instructorUsers.map(user => ({
      _id: user._id,
      name: user.fullName,
      title: 'Instructor',
      description: user.bio || 'Instructor at our institution',
      profileImage: {
        url: user.profileImage || '',
        fileId: ''
      },
      email: user.email,
      isActive: true,
      createdAt: user.createdAt,
      isFromUserCollection: true // Flag to identify source
    }));
    
    // Combine both sources
    const allInstructors = [...instructors, ...transformedUsers];
    
    res.json({
      success: true,
      count: allInstructors.length,
      data: allInstructors
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructors',
      error: error.message
    });
  }
};

// Get single instructor (public)
exports.getInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor',
      error: error.message
    });
  }
};

// Get all instructors for admin (includes inactive)
exports.getAllInstructorsAdmin = async (req, res) => {
  try {
    // Get instructors from Instructor collection (includes inactive)
    const instructors = await Instructor.find()
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'fullName email');
    
    // Get users with instructor role
    const instructorUsers = await User.find({ role: 'instructor' })
      .select('fullName email profileImage bio createdAt isVerified');
    
    // Transform user data to match instructor format
    const transformedUsers = instructorUsers.map(user => ({
      _id: user._id,
      name: user.fullName,
      title: 'Instructor',
      description: user.bio || 'Instructor at our institution',
      profileImage: {
        url: user.profileImage || '',
        fileId: ''
      },
      email: user.email,
      isActive: true,
      order: 999, // Place user-based instructors at the end
      createdAt: user.createdAt,
      isFromUserCollection: true, // Flag to identify source
      isVerified: user.isVerified
    }));
    
    // Combine both sources
    const allInstructors = [...instructors, ...transformedUsers];
    
    res.json({
      success: true,
      count: allInstructors.length,
      data: allInstructors
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructors',
      error: error.message
    });
  }
};

// Create instructor (admin only)
exports.createInstructor = async (req, res) => {
  try {
    const instructorData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const instructor = await Instructor.create(instructorData);
    
    res.status(201).json({
      success: true,
      message: 'Instructor created successfully',
      data: instructor
    });
  } catch (error) {
    console.error('Error creating instructor:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create instructor',
      error: error.message
    });
  }
};

// Update instructor (admin only)
exports.updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Instructor updated successfully',
      data: instructor
    });
  } catch (error) {
    console.error('Error updating instructor:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update instructor',
      error: error.message
    });
  }
};

// Delete instructor (admin only)
exports.deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete instructor',
      error: error.message
    });
  }
};

// Reorder instructors (admin only)
exports.reorderInstructors = async (req, res) => {
  try {
    const { instructors } = req.body; // Array of { id, order }
    
    const updatePromises = instructors.map(item =>
      Instructor.findByIdAndUpdate(item.id, { order: item.order })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Instructors reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering instructors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder instructors',
      error: error.message
    });
  }
};

