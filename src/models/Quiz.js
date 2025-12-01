const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please provide question text'],
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    default: 'multiple-choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String, // For short-answer and essay questions
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  explanation: String, // Explanation shown after answering
  order: {
    type: Number,
    default: 0
  }
});

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course ID']
  },
  title: {
    type: String,
    required: [true, 'Please provide quiz title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['quiz', 'test', 'final-exam'],
    default: 'quiz'
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  passingScore: {
    type: Number, // percentage
    default: 70,
    min: 0,
    max: 100
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  attemptsAllowed: {
    type: Number,
    default: 3, // -1 for unlimited
    min: -1
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true // Show after submission
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }
  next();
});

// Index for sorting and querying
quizSchema.index({ course: 1, order: 1 });
quizSchema.index({ course: 1, isActive: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;

