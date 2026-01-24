const mongoose = require('mongoose');

const coursePageSchema = new mongoose.Schema({
  // Hero Section
  heroTitle: {
    type: String,
    default: 'Master Industry-Standard CAD, CAE & Engineering Tools'
  },
  heroDescription: {
    type: String,
    default: 'In today\'s competitive engineering landscape...'
  },

  // Who Should Enroll Section
  whoShouldEnroll: [{
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],

  // What You Will Learn Section
  whatYouWillLearn: [{
    point: { type: String, required: true }
  }],

  // Why Choose Us Section
  whyChooseUs: [{
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],

  // FAQ Section
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],

  // Active status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one active configuration exists
coursePageSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('CoursePage', coursePageSchema);
