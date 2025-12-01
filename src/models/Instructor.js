const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide instructor name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Please provide instructor title/position'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide instructor description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  profileImage: {
    url: {
      type: String,
      default: ''
    },
    fileId: {
      type: String,
      default: ''
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    min: 0
  },
  previousCompanies: [{
    type: String,
    trim: true
  }],
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  achievements: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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
instructorSchema.index({ order: 1, createdAt: -1 });

const Instructor = mongoose.model('Instructor', instructorSchema);

module.exports = Instructor;

