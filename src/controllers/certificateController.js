const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

// Generate certificate for user
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    
    // Check if user is enrolled in course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      user: userId,
      course: courseId,
      isActive: true
    });
    
    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this course',
        data: existingCert
      });
    }
    
    // Calculate course completion stats
    const quizzes = await Quiz.find({ course: courseId, isActive: true });
    const attempts = await QuizAttempt.find({
      user: userId,
      course: courseId,
      status: 'completed'
    });
    
    // Calculate average scores
    const quizAttempts = attempts.filter(a => {
      const quiz = quizzes.find(q => q._id.toString() === a.quiz.toString());
      return quiz?.type === 'quiz';
    });
    
    const testAttempts = attempts.filter(a => {
      const quiz = quizzes.find(q => q._id.toString() === a.quiz.toString());
      return quiz?.type === 'test' || quiz?.type === 'final-exam';
    });
    
    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
      : 0;
      
    const avgTestScore = testAttempts.length > 0
      ? Math.round(testAttempts.reduce((sum, a) => sum + a.percentage, 0) / testAttempts.length)
      : 0;
    
    const overallScore = Math.round((avgQuizScore + avgTestScore) / 2) || avgQuizScore || avgTestScore;
    
    // Determine grade
    let grade = 'Pass';
    if (overallScore >= 95) grade = 'A+';
    else if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 85) grade = 'B+';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 75) grade = 'C+';
    else if (overallScore >= 70) grade = 'C';
    
    // Create certificate
    const certificate = await Certificate.create({
      user: userId,
      course: courseId,
      studentName: req.user.fullName,
      courseName: course.title,
      grade,
      score: overallScore,
      instructorName: 'Isaac Institute of Technology',
      completionDate: new Date(),
      metadata: {
        totalQuizzes: quizAttempts.length,
        averageQuizScore: avgQuizScore,
        totalTests: testAttempts.length,
        averageTestScore: avgTestScore,
        completionPercentage: 100
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error.message
    });
  }
};

// Get user's certificates
exports.getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      user: req.user._id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .populate('course', 'title description thumbnail');
    
    res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
};

// Get certificate by ID
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('course', 'title description');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Check if user owns this certificate or is admin
    if (certificate.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: error.message
    });
  }
};

// Verify certificate (public)
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    
    const certificate = await Certificate.findOne({ 
      certificateNumber,
      isActive: true 
    })
      .populate('user', 'fullName')
      .populate('course', 'title');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid'
      });
    }
    
    res.json({
      success: true,
      message: 'Certificate is valid',
      data: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        issueDate: certificate.issueDate,
        grade: certificate.grade,
        score: certificate.score
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
};

// Download certificate as PDF (placeholder - needs PDF generation library)
exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('course', 'title');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Check if user owns this certificate or is admin
    if (certificate.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // TODO: Generate PDF using a library like pdfkit or puppeteer
    // For now, return certificate data
    res.json({
      success: true,
      message: 'Certificate download ready',
      data: certificate
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message
    });
  }
};

// Admin: Get all certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email')
      .populate('course', 'title');
    
    res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching all certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
};

// Admin: Revoke certificate
exports.revokeCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke certificate',
      error: error.message
    });
  }
};

