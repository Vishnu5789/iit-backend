const mongoose = require('mongoose');

const contactConfigSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    default: 'info@isaactech.com'
  },
  phone: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  address: {
    street: {
      type: String,
      default: '123 Engineering Lane'
    },
    city: {
      type: String,
      default: 'Tech City'
    },
    state: {
      type: String,
      default: 'CA'
    },
    zipCode: {
      type: String,
      default: '90001'
    },
    country: {
      type: String,
      default: 'USA'
    }
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  officeHours: {
    weekdays: {
      type: String,
      default: 'Monday - Friday: 9:00 AM - 6:00 PM'
    },
    weekend: {
      type: String,
      default: 'Saturday - Sunday: Closed'
    }
  },
  mapUrl: {
    type: String,
    default: ''
  },
  pageContent: {
    heading: {
      type: String,
      default: 'Get in Touch'
    },
    subheading: {
      type: String,
      default: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'
    }
  }
}, {
  timestamps: true
});

// Ensure only one config document exists
contactConfigSchema.index({}, { unique: true });

const ContactConfig = mongoose.model('ContactConfig', contactConfigSchema);

module.exports = ContactConfig;

