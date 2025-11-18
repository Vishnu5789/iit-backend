const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an industry name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1500, 'Description cannot exceed 1500 characters']
  },
  icon: {
    type: String,
    default: 'BuildingOffice2Icon'
  },
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

// Index for faster queries
industrySchema.index({ isActive: 1, order: 1 });

const Industry = mongoose.model('Industry', industrySchema);

module.exports = Industry;

