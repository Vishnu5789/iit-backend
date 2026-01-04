const mongoose = require('mongoose');

const blogSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unsubscribeToken: {
    type: String,
    default: function() {
      return require('crypto').randomBytes(32).toString('hex');
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
blogSubscriberSchema.index({ email: 1 });
blogSubscriberSchema.index({ isActive: 1 });

const BlogSubscriber = mongoose.model('BlogSubscriber', blogSubscriberSchema);

module.exports = BlogSubscriber;

