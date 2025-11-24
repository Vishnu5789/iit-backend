const mongoose = require('mongoose');

const aboutConfigSchema = new mongoose.Schema({
  // Hero Section
  heroHeading: {
    type: String,
    default: 'About Isaac Institute of Technology'
  },
  heroSubheading: {
    type: String,
    default: 'Empowering Engineers for Tomorrow\'s Challenges'
  },
  heroDescription: {
    type: String,
    default: 'Learn more about our company and mission.'
  },
  heroImage: {
    url: { type: String, default: '/assets/about-hero.svg' },
    fileId: { type: String, default: '' }
  },

  // Mission Section
  missionHeading: {
    type: String,
    default: 'Our Mission'
  },
  missionContent: {
    type: String,
    default: 'To empower every design engineer with the practical skills, theoretical depth, and innovative mindset required to solve complex challenges and lead the future of product development.'
  },
  missionImage: {
    url: { type: String, default: '/assets/mission.svg' },
    fileId: { type: String, default: '' }
  },

  // Vision Section
  visionHeading: {
    type: String,
    default: 'Our Vision'
  },
  visionContent: {
    type: String,
    default: 'A world where engineering education is no longer a barrier to innovation, but its catalyst. We envision a global community where engineers can continuously learn, apply, and excel throughout their careers.'
  },
  visionImage: {
    url: { type: String, default: '/assets/vision.svg' },
    fileId: { type: String, default: '' }
  },

  // Story Section
  storyHeading: {
    type: String,
    default: 'Our Story'
  },
  storyContent: {
    type: String,
    default: 'Isaac Institute of Technology was born from a disconnect. In a world of rapid technological advancement, design engineers were often left with theoretical knowledge or shallow software tutorials, but little guidance on how to bridge the gap to practical, robust, and manufacturable design.'
  },

  // Values
  values: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'CheckCircle' }
  }],

  // Team Members
  team: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String },
    image: {
      url: { type: String },
      fileId: { type: String }
    },
    linkedin: { type: String },
    twitter: { type: String }
  }],

  // Statistics
  stats: {
    students: {
      value: { type: Number, default: 10000 },
      label: { type: String, default: 'Students Worldwide' }
    },
    courses: {
      value: { type: Number, default: 50 },
      label: { type: String, default: 'Expert-Led Courses' }
    },
    rating: {
      value: { type: Number, default: 4.8 },
      label: { type: String, default: 'Average Rating' }
    },
    industries: {
      value: { type: Number, default: 15 },
      label: { type: String, default: 'Industries Served' }
    }
  }
}, {
  timestamps: true
});

const AboutConfig = mongoose.model('AboutConfig', aboutConfigSchema);

module.exports = AboutConfig;

