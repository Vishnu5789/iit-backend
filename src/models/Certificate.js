const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user ID']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course ID']
  },
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date,
    default: Date.now
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date // Optional, some certificates don't expire
  },
  grade: {
    type: String, // A+, A, B+, etc.
    default: 'Pass'
  },
  score: {
    type: Number, // Overall course score percentage
    default: 0
  },
  instructorName: {
    type: String
  },
  instructorSignature: {
    url: String,
    fileId: String
  },
  certificateTemplate: {
    type: String,
    enum: ['default', 'professional', 'modern', 'classic'],
    default: 'default'
  },
  verificationUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    totalQuizzes: Number,
    averageQuizScore: Number,
    totalTests: Number,
    averageTestScore: Number,
    totalTimeSpent: Number, // in hours
    completionPercentage: Number
  }
}, {
  timestamps: true
});

// Generate unique certificate number before saving
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.certificateNumber = `IIT-${timestamp}-${random}`;
  }
  
  // Generate verification URL
  if (!this.verificationUrl) {
    this.verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${this.certificateNumber}`;
  }
  
  next();
});

// Index for querying and verification
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ user: 1, course: 1 });
certificateSchema.index({ user: 1, isActive: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;

