const Webinar = require('../models/Webinar');
const WebinarConfig = require('../models/WebinarConfig');
const { sendEmail } = require('../config/email');

/**
 * Helper function to send webinar invitation email
 */
const sendWebinarInvitationEmail = async (webinar, webinarConfig) => {
  if (!webinarConfig || !webinarConfig.zoomLink) {
    throw new Error('Webinar configuration or Zoom link not found');
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Webinar Registration Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0b5563 0%, #0d6e7f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Webinar Registration Confirmed!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Dear ${webinar.fullName},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for registering for our webinar: <strong>${webinarConfig.heading || 'Design Engineering Webinar'}</strong>
        </p>
        
        <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0b5563;">
          <h2 style="color: #0b5563; margin-top: 0;">Webinar Details</h2>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${webinarConfig.date || 'TBA'}</p>
          <p style="margin: 10px 0;"><strong>Time:</strong> ${webinarConfig.time || 'TBA'}</p>
          <p style="margin: 10px 0;"><strong>Platform:</strong> ${webinarConfig.platform || 'Zoom'}</p>
        </div>
        
        <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #0b5563; margin-top: 0;">Join the Webinar</h3>
          <a href="${webinarConfig.zoomLink}" 
             style="display: inline-block; background: #0b5563; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;">
            Click here to join the webinar
          </a>
          <p style="font-size: 14px; color: #666; margin-top: 15px;">
            Or copy this link: <br>
            <a href="${webinarConfig.zoomLink}" style="color: #0b5563; word-break: break-all;">${webinarConfig.zoomLink}</a>
          </p>
        </div>
        
        <p style="font-size: 16px; margin-top: 30px;">
          We look forward to seeing you at the webinar!
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Best regards,<br>
          <strong>Isaac Institute of Technology</strong>
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: webinar.email,
    subject: `Webinar Registration Confirmed - ${webinarConfig.heading || 'Design Engineering Webinar'}`,
    html: emailHtml
  });
};

/**
 * @desc    Submit webinar registration
 * @route   POST /api/webinar
 * @access  Public
 */
const submitWebinarRegistration = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      currentEducation,
      interestAreas
    } = req.body;

    // Validate required fields
    const requiredFields = {
      fullName,
      email,
      contactNumber,
      currentEducation,
      interestAreas
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || (Array.isArray(value) && value.length === 0))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
        missingFields
      });
    }

    // Validate interest areas (must be an array with at least one item)
    if (!Array.isArray(interestAreas) || interestAreas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one interest area'
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

    // Check if user with same email or contact already registered
    const existingRegistration = await Webinar.findOne({
      $or: [
        { email: email.toLowerCase() },
        { contactNumber }
      ]
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this webinar with this email or contact number'
      });
    }

    // Create webinar registration
    const webinar = await Webinar.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      contactNumber: contactNumber.trim(),
      currentEducation: currentEducation.trim(),
      interestAreas: interestAreas.map(area => area.trim())
    });

    // Get webinar config to send zoom link
    const webinarConfig = await WebinarConfig.findOne();
    
    let emailSent = false;
    if (webinarConfig && webinarConfig.zoomLink) {
      // Send email with zoom link
      try {
        await sendWebinarInvitationEmail(webinar, webinarConfig);
        
        // Update webinar registration to mark email as sent
        webinar.emailSent = true;
        webinar.emailSentAt = new Date();
        await webinar.save();
        
        emailSent = true;
        console.log(`Webinar invitation email sent to ${webinar.email}`);
      } catch (emailError) {
        console.error('Error sending webinar invitation email:', emailError);
        // Don't fail the registration if email fails, just log it
      }
    }

    res.status(201).json({
      success: true,
      message: emailSent 
        ? 'Webinar registration successful! We have sent you the Zoom link via email.'
        : 'Webinar registration successful! We will send you the Zoom link via email.',
      data: {
        id: webinar._id,
        fullName: webinar.fullName,
        email: webinar.email,
        emailSent
      }
    });
  } catch (error) {
    console.error('Submit webinar registration error:', error);
    
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
        message: 'You are already registered for this webinar with this email or contact number'
      });
    }

    next(error);
  }
};

/**
 * @desc    Get all webinar registrations (Admin only)
 * @route   GET /api/webinar
 * @access  Private (Admin)
 */
const getWebinarRegistrations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const registrations = await Webinar.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Webinar.countDocuments(query);

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get webinar registrations error:', error);
    next(error);
  }
};

/**
 * @desc    Get single webinar registration (Admin only)
 * @route   GET /api/webinar/:id
 * @access  Private (Admin)
 */
const getWebinarRegistration = async (req, res, next) => {
  try {
    const registration = await Webinar.findById(req.params.id).select('-__v');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Webinar registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Get webinar registration error:', error);
    next(error);
  }
};

/**
 * @desc    Update webinar registration status (Admin only)
 * @route   PUT /api/webinar/:id
 * @access  Private (Admin)
 */
const updateWebinarStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const validStatuses = ['registered', 'attended', 'absent'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: registered, attended, absent'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const registration = await Webinar.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Webinar registration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Webinar registration status updated successfully',
      data: registration
    });
  } catch (error) {
    console.error('Update webinar status error:', error);
    next(error);
  }
};

/**
 * @desc    Delete webinar registration (Admin only)
 * @route   DELETE /api/webinar/:id
 * @access  Private (Admin)
 */
const deleteWebinarRegistration = async (req, res, next) => {
  try {
    const registration = await Webinar.findByIdAndDelete(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Webinar registration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Webinar registration deleted successfully'
    });
  } catch (error) {
    console.error('Delete webinar registration error:', error);
    next(error);
  }
};

/**
 * @desc    Resend webinar invitation email (Admin only)
 * @route   POST /api/webinar/:id/resend-email
 * @access  Private (Admin)
 */
const resendWebinarEmail = async (req, res, next) => {
  try {
    const webinar = await Webinar.findById(req.params.id);

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: 'Webinar registration not found'
      });
    }

    // Get webinar config
    const webinarConfig = await WebinarConfig.findOne();
    
    if (!webinarConfig || !webinarConfig.zoomLink) {
      return res.status(400).json({
        success: false,
        message: 'Webinar configuration or Zoom link not found. Please configure the webinar first.'
      });
    }

    try {
      // Send email
      await sendWebinarInvitationEmail(webinar, webinarConfig);
      
      // Update email sent status
      webinar.emailSent = true;
      webinar.emailSentAt = new Date();
      await webinar.save();

      res.status(200).json({
        success: true,
        message: 'Webinar invitation email sent successfully',
        data: webinar
      });
    } catch (emailError) {
      console.error('Error sending webinar invitation email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Please check email configuration.',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Resend webinar email error:', error);
    next(error);
  }
};

/**
 * @desc    Get webinar statistics (Admin only)
 * @route   GET /api/webinar/stats
 * @access  Private (Admin)
 */
const getWebinarStats = async (req, res, next) => {
  try {
    const total = await Webinar.countDocuments();
    const registered = await Webinar.countDocuments({ status: 'registered' });
    const attended = await Webinar.countDocuments({ status: 'attended' });
    const absent = await Webinar.countDocuments({ status: 'absent' });
    const emailSent = await Webinar.countDocuments({ emailSent: true });
    const emailNotSent = await Webinar.countDocuments({ emailSent: false });

    res.status(200).json({
      success: true,
      data: {
        total,
        registered,
        attended,
        absent,
        emailSent,
        emailNotSent
      }
    });
  } catch (error) {
    console.error('Get webinar stats error:', error);
    next(error);
  }
};

module.exports = {
  submitWebinarRegistration,
  getWebinarRegistrations,
  getWebinarRegistration,
  updateWebinarStatus,
  deleteWebinarRegistration,
  resendWebinarEmail,
  getWebinarStats
};

