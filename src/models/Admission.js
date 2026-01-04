const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  education: {
    type: String,
    required: [true, 'Education/Branch is required'],
    trim: true
  },
  experience: {
    type: String,
    trim: true,
    default: ''
  },
  aadharCardNumber: {
    type: String,
    required: [true, 'Aadhar card number is required'],
    trim: true,
    match: [/^\d{12}$/, 'Aadhar card number must be 12 digits']
  },
  courseApplied: {
    type: String,
    required: [true, 'Course applied is required'],
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit contact number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
    trim: true,
    default: 'Indian'
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'accepted', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
admissionSchema.index({ status: 1, createdAt: -1 });
admissionSchema.index({ email: 1 });
admissionSchema.index({ contactNumber: 1 });

const Admission = mongoose.model('Admission', admissionSchema);

module.exports = Admission;

