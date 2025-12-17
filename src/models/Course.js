const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  syllabus: {
    url: {
      type: String,
      required: [true, 'Please upload course syllabus'],
      default: ''
    },
    fileId: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  duration: {
    type: String,
    required: [true, 'Please provide course duration'],
    trim: true
  },
  level: {
    type: String,
    required: [true, 'Please provide course level'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Beginner to Intermediate', 'Beginner to Advanced', 'Intermediate to Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    enum: ['CAD', 'CAE', 'PCB Design', 'Programming', 'Other'],
    default: 'Other'
  },
  price: {
    type: Number,
    required: [true, 'Please provide course price'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    default: 0
  },
  thumbnail: {
    url: {
      type: String,
      required: [true, 'Please upload course thumbnail'],
      default: ''
    },
    fileId: {
      type: String,
      default: ''
    }
  },
  sampleVideos: {
    type: [{
      name: String,
      url: String,
      fileId: String,
      duration: String,
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'At least one sample video is required'
    }
  },
  // Folder-based media organization
  mediaFolders: [{
    folderName: {
      type: String,
      required: true,
      trim: true
    },
    videos: [{
      name: String,
      url: String,
      fileId: String,
      duration: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    pdfs: [{
      name: String,
      url: String,
      fileId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    images: [{
      url: String,
      fileId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Keep old fields for backward compatibility (deprecated)
  pdfFiles: {
    type: [{
      name: String,
      url: String,
      fileId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  videoFiles: {
    type: [{
      name: String,
      url: String,
      fileId: String,
      duration: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  images: [{
    url: String,
    fileId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  textContent: [{
    title: String,
    content: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  externalVideoLinks: [{
    title: String,
    url: String,
    description: String,
    platform: {
      type: String,
      enum: ['youtube', 'vimeo', 'other'],
      default: 'other'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  keyPoints: [{
    type: String,
    required: true
  }],
  aboutCourse: {
    type: String,
    required: [true, 'Please provide about course information'],
    maxlength: [2000, 'About course cannot exceed 2000 characters']
  },
  eligibility: [{
    type: String,
    required: true
  }],
  objectives: [{
    type: String,
    required: true
  }],
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

// Custom validation for media folders
courseSchema.pre('validate', function(next) {
  // If using new folder structure, validate folders have content
  if (this.mediaFolders && this.mediaFolders.length > 0) {
    const hasContent = this.mediaFolders.some(folder => 
      (folder.videos && folder.videos.length > 0) ||
      (folder.pdfs && folder.pdfs.length > 0) ||
      (folder.images && folder.images.length > 0)
    );
    if (!hasContent) {
      return next(new Error('At least one folder must contain media content (videos, PDFs, or images)'));
    }
  } else {
    // Fallback: validate old structure if no folders
    if ((!this.videoFiles || this.videoFiles.length === 0) && 
        (!this.pdfFiles || this.pdfFiles.length === 0)) {
      return next(new Error('At least one video or PDF is required'));
    }
  }
  next();
});

// Index for faster queries
courseSchema.index({ isActive: 1, createdAt: -1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

