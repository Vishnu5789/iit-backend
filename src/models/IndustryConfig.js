const mongoose = require('mongoose');

const industryConfigSchema = new mongoose.Schema({
  // Hero Section
  heroHeading: {
    type: String,
    default: 'Industry Applications'
  },
  heroSubheading: {
    type: String,
    default: 'Real-World Engineering That Drives Innovation'
  },
  heroDescription: {
    type: String,
    default: 'Engineering design isn\'t just academic theory—it\'s the foundation of every product, structure, and system that shapes our modern world.'
  },

  // Real-World Projects
  projects: [{
    title: { type: String, required: true },
    tools: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 }
  }],

  // Workflow Section
  workflowHeading: {
    type: String,
    default: 'How Our Courses Align With Industry Workflows'
  },
  workflowContent: {
    type: String,
    default: 'We don\'t teach software in isolation—we teach industry-standard workflows.'
  },

  // Industry Benefits
  benefits: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'CheckCircle' },
    order: { type: Number, default: 0 }
  }],

  // Companies Section
  companiesHeading: {
    type: String,
    default: 'Companies We Work With'
  },
  companiesDescription: {
    type: String,
    default: 'Our graduates have joined leading organizations across diverse industries:'
  },
  companyCategories: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 }
  }],

  // CTA Section
  ctaHeading: {
    type: String,
    default: 'Ready to Make Your Mark in Industry?'
  },
  ctaDescription: {
    type: String,
    default: 'The engineering industry doesn\'t wait, and neither should you.'
  },
  ctaButtonText: {
    type: String,
    default: 'Start Your Journey Today'
  },
  ctaButtonLink: {
    type: String,
    default: '/courses'
  }
}, {
  timestamps: true
});

const IndustryConfig = mongoose.model('IndustryConfig', industryConfigSchema);

module.exports = IndustryConfig;

