const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a blog title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['CAD', 'CAE', 'Mechanical Engineering', 'Electrical/PCB Design', 'Product Design', 'Industry 4.0'],
    default: 'CAD'
  },
  summary: {
    type: String,
    required: [true, 'Please provide a summary'],
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide blog content'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
blogSchema.index({ isPublished: 1, publishedDate: -1 });
blogSchema.index({ category: 1 });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

