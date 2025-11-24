const mongoose = require('mongoose');

const homeConfigSchema = new mongoose.Schema({
  heroImage: {
    url: String,
    fileId: String
  },
  starsImage: {
    url: String,
    fileId: String
  },
  visionImage: {
    url: String,
    fileId: String
  },
  teamCollaborationImage: {
    url: String,
    fileId: String
  },
  goalsImage: {
    url: String,
    fileId: String
  },
  journeyImage: {
    url: String,
    fileId: String
  },
  stats: {
    studentsCount: {
      type: String,
      default: '10K+'
    },
    coursesCount: {
      type: String,
      default: '50+'
    },
    averageRating: {
      type: String,
      default: '4.8★'
    }
  },
  heroText: {
    badge: {
      type: String,
      default: 'Engineering is Future'
    },
    headline: {
      type: String,
      default: 'Master the Skills That Build Tomorrow'
    },
    description: {
      type: String,
      default: 'Learn CAD, CAE, PCB Design, and Programming from industry experts. Join thousands of engineers shaping the future of technology.'
    }
  }
}, {
  timestamps: true
});

// Ensure only one config document exists
homeConfigSchema.index({}, { unique: true });

const HomeConfig = mongoose.model('HomeConfig', homeConfigSchema);

module.exports = HomeConfig;

