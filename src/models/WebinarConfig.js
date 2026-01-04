const mongoose = require('mongoose');

const webinarConfigSchema = new mongoose.Schema({
  heading: {
    type: String,
    default: 'Dive into the Future of Design Engineering!'
  },
  subheading: {
    type: String,
    default: 'Join Isaac Institute of Technology for an exclusive live webinar.'
  },
  description: {
    type: String,
    default: 'Discover the exciting world of design engineering and explore cutting-edge trends that are shaping the future of manufacturing and product development. This webinar is designed for students, professionals, and anyone interested in advancing their career in engineering design.'
  },
  highlights: {
    type: [String],
    default: [
      'Industry insights from leading design engineering experts',
      'Emerging trends in CAD, CAE, IoT, and sustainable design',
      'Career pathways and growth opportunities in design engineering',
      'Live Q&A session with industry professionals',
      'Certificate of participation for all attendees',
      'Special offers and discounts for course enrollment'
    ]
  },
  date: {
    type: String,
    default: 'Saturday, 25th October 2025'
  },
  time: {
    type: String,
    default: '11:00 AM – 12:30 PM (IST)'
  },
  platform: {
    type: String,
    default: 'Live on Zoom'
  },
  platformNote: {
    type: String,
    default: '(Link shared after email registration)'
  },
  zoomLink: {
    type: String,
    required: [true, 'Zoom link is required'],
    trim: true
  },
  interestAreas: {
    type: [String],
    default: [
      'CAD Design & Modeling',
      'CAE Analysis & Simulation',
      'IoT & Smart Systems',
      'Sustainable Design',
      'Product Development',
      'Manufacturing Processes',
      'Industry 4.0 Technologies',
      'Career Guidance'
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one config document exists
webinarConfigSchema.index({}, { unique: true });

const WebinarConfig = mongoose.model('WebinarConfig', webinarConfigSchema);

module.exports = WebinarConfig;

