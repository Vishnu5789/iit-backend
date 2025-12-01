const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: Number, // Index of selected option for multiple choice
  answer: String, // For short-answer and essay
  isCorrect: Boolean,
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: Number // seconds spent on this question
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Please provide quiz ID']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user ID']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course ID']
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  attemptNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Calculate score before saving
quizAttemptSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.pointsEarned = this.answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    if (this.totalPoints > 0) {
      this.percentage = Math.round((this.pointsEarned / this.totalPoints) * 100);
    }
  }
  next();
});

// Index for querying
quizAttemptSchema.index({ quiz: 1, user: 1, createdAt: -1 });
quizAttemptSchema.index({ user: 1, course: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt;

