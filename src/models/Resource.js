const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Resource description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'E-Books & Textbooks',
      'Lecture Notes',
      'Mindmaps & Flowcharts',
      'Infographics',
      'Diagrams & Images',
      'Interview Preparation',
      'Formula Handbooks',
      'Question Banks',
      'Skill Development',
      'Career Resources',
      'Company Profiles'
    ]
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: [
      'Course Materials',
      'Visual Learning Aids',
      'Study Guides',
      'Skill Development',
      'Career Resources',
      'Company Profiles'
    ]
  },
  subcategory: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: ['free', 'paid']
  },
  price: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String,
    enum: ['PDF', 'PPT', 'DOC', 'IMAGE', 'VIDEO', 'LINK'],
    required: true
  },
  file: {
    url: String,
    fileId: String,
    name: String
  },
  thumbnail: {
    url: String,
    fileId: String
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  accessibleTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better search performance
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ category: 1, type: 1, isActive: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
