const mongoose = require('mongoose');

const contactWidgetSchema = new mongoose.Schema({
  isEnabled: {
    type: Boolean,
    default: true
  },
  whatsappNumber: {
    type: String,
    default: '',
    trim: true
  },
  phoneNumber: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  position: {
    type: String,
    enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    default: 'bottom-right'
  },
  showOnPages: {
    type: [String],
    default: ['all'] // 'all', 'home', 'courses', 'course-detail', 'about', 'contact', 'blog', 'industry'
  },
  chatbotEnabled: {
    type: Boolean,
    default: false
  },
  chatbotScript: {
    type: String,
    default: ''
  },
  customMessage: {
    type: String,
    default: 'How can we help you today?'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const ContactWidget = mongoose.model('ContactWidget', contactWidgetSchema);

module.exports = ContactWidget;

