const Admission = require('../models/Admission');

/**
 * @desc    Submit admission form
 * @route   POST /api/admissions
 * @access  Public
 */
const submitAdmission = async (req, res, next) => {
  try {
    const {
      name,
      fatherName,
      dateOfBirth,
      gender,
      address,
      education,
      experience,
      aadharCardNumber,
      courseApplied,
      contactNumber,
      email,
      nationality
    } = req.body;

    // Validate required fields
    const requiredFields = {
      name,
      fatherName,
      dateOfBirth,
      gender,
      address,
      education,
      aadharCardNumber,
      courseApplied,
      contactNumber,
      email,
      nationality
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
        missingFields
      });
    }

    // Validate Aadhar card number format (12 digits)
    if (!/^\d{12}$/.test(aadharCardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar card number must be exactly 12 digits'
      });
    }

    // Validate contact number format (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit contact number'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid gender option'
      });
    }

    // Check if admission with same email or contact already exists
    const existingAdmission = await Admission.findOne({
      $or: [
        { email: email.toLowerCase() },
        { contactNumber }
      ]
    });

    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: 'An admission application with this email or contact number already exists'
      });
    }

    // Create admission record
    const admission = await Admission.create({
      name: name.trim(),
      fatherName: fatherName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender: gender.toLowerCase(),
      address: address.trim(),
      education: education.trim(),
      experience: experience ? experience.trim() : '',
      aadharCardNumber: aadharCardNumber.trim(),
      courseApplied: courseApplied.trim(),
      contactNumber: contactNumber.trim(),
      email: email.toLowerCase().trim(),
      nationality: nationality ? nationality.trim() : 'Indian'
    });

    res.status(201).json({
      success: true,
      message: 'Admission form submitted successfully! We will contact you soon.',
      data: {
        id: admission._id,
        name: admission.name,
        email: admission.email
      }
    });
  } catch (error) {
    console.error('Submit admission error:', error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An admission application with this email or contact number already exists'
      });
    }

    next(error);
  }
};

/**
 * @desc    Get all admissions (Admin only)
 * @route   GET /api/admissions
 * @access  Private (Admin)
 */
const getAdmissions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const admissions = await Admission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Admission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: admissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admissions error:', error);
    next(error);
  }
};

/**
 * @desc    Get single admission (Admin only)
 * @route   GET /api/admissions/:id
 * @access  Private (Admin)
 */
const getAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id).select('-__v');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    console.error('Get admission error:', error);
    next(error);
  }
};

/**
 * @desc    Update admission status (Admin only)
 * @route   PUT /api/admissions/:id
 * @access  Private (Admin)
 */
const updateAdmissionStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'under_review', 'accepted', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, under_review, accepted, rejected'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admission status updated successfully',
      data: admission
    });
  } catch (error) {
    console.error('Update admission status error:', error);
    next(error);
  }
};

/**
 * @desc    Delete admission (Admin only)
 * @route   DELETE /api/admissions/:id
 * @access  Private (Admin)
 */
const deleteAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admission deleted successfully'
    });
  } catch (error) {
    console.error('Delete admission error:', error);
    next(error);
  }
};

/**
 * @desc    Get admission statistics (Admin only)
 * @route   GET /api/admissions/stats
 * @access  Private (Admin)
 */
const getAdmissionStats = async (req, res, next) => {
  try {
    const total = await Admission.countDocuments();
    const pending = await Admission.countDocuments({ status: 'pending' });
    const underReview = await Admission.countDocuments({ status: 'under_review' });
    const accepted = await Admission.countDocuments({ status: 'accepted' });
    const rejected = await Admission.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        underReview,
        accepted,
        rejected
      }
    });
  } catch (error) {
    console.error('Get admission stats error:', error);
    next(error);
  }
};

module.exports = {
  submitAdmission,
  getAdmissions,
  getAdmission,
  updateAdmissionStatus,
  deleteAdmission,
  getAdmissionStats
};

