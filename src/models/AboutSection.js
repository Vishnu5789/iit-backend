const mongoose = require('mongoose');

const aboutSectionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sectionType: {
    type: String,
    enum: ['hero', 'text', 'list', 'card'],
    default: 'text'
  },
  metadata: {
    subtitle: String,
    items: [String],
    imageUrl: String
  },
  image: {
    url: {
      type: String,
      default: ''
    },
    fileId: {
      type: String,
      default: ''
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for sorting
aboutSectionSchema.index({ order: 1 });

const AboutSection = mongoose.model('AboutSection', aboutSectionSchema);

module.exports = AboutSection;

