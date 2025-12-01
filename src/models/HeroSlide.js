const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide slide title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: [true, 'Please specify slide type (image or video)'],
    default: 'image'
  },
  media: {
    url: {
      type: String,
      required: [true, 'Please provide media URL'],
      trim: true
    },
    fileId: {
      type: String,
      default: ''
    }
  },
  buttonText: {
    type: String,
    trim: true,
    default: 'READ MORE'
  },
  buttonLink: {
    type: String,
    trim: true,
    default: '/about'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  autoplayDuration: {
    type: Number,
    default: 5000, // milliseconds
    min: 1000,
    max: 30000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for sorting
heroSlideSchema.index({ order: 1, createdAt: -1 });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);

module.exports = HeroSlide;

