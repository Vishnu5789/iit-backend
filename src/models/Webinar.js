const mongoose = require('mongoose');

const webinarSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
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
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit contact number']
  },
  currentEducation: {
    type: String,
    required: [true, 'Current education/profession is required'],
    trim: true
  },
  interestAreas: {
    type: [String],
    required: [true, 'At least one interest area must be selected'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one interest area must be selected'
    }
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'absent'],
    default: 'registered'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
webinarSchema.index({ status: 1, createdAt: -1 });
webinarSchema.index({ email: 1 });
webinarSchema.index({ contactNumber: 1 });

const Webinar = mongoose.model('Webinar', webinarSchema);

module.exports = Webinar;

