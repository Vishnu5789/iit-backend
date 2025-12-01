const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');

// Get all quizzes for a course (Student view - active only)
exports.getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log('📝 Fetching quizzes for course:', courseId);
    
    const allQuizzes = await Quiz.find({ course: courseId });
    console.log('📝 Total quizzes found:', allQuizzes.length);
    console.log('📝 All quizzes:', allQuizzes.map(q => ({ title: q.title, isActive: q.isActive })));
    
    const quizzes = await Quiz.find({ 
      course: courseId, 
      isActive: true 
    })
      .sort({ order: 1, createdAt: 1 })
      .select('-questions.correctAnswer -questions.options.isCorrect'); // Hide answers
    
    console.log('📝 Active quizzes:', quizzes.length);
    
    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('❌ Error fetching course quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Get single quiz (Student view - without answers)
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title')
      .select('-questions.correctAnswer');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if user has attempts left
    if (req.user) {
      const attempts = await QuizAttempt.countDocuments({
        quiz: quiz._id,
        user: req.user._id,
        status: 'completed'
      });
      
      quiz._doc.attemptsUsed = attempts;
      quiz._doc.attemptsRemaining = quiz.attemptsAllowed === -1 
        ? 'Unlimited' 
        : Math.max(0, quiz.attemptsAllowed - attempts);
    }
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
};

// Start quiz attempt
exports.startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check attempts limit
    const completedAttempts = await QuizAttempt.countDocuments({
      quiz: quiz._id,
      user: req.user._id,
      status: 'completed'
    });
    
    if (quiz.attemptsAllowed !== -1 && completedAttempts >= quiz.attemptsAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }
    
    // Create new attempt
    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      user: req.user._id,
      course: quiz.course,
      totalPoints: quiz.totalPoints,
      attemptNumber: completedAttempts + 1,
      status: 'in-progress'
    });
    
    // Return quiz without correct answers
    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => ({
      ...q,
      correctAnswer: undefined,
      options: q.options?.map(opt => ({
        text: opt.text,
        _id: opt._id
      }))
    }));
    
    res.json({
      success: true,
      message: 'Quiz started successfully',
      data: {
        attemptId: attempt._id,
        quiz: quizData
      }
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz',
      error: error.message
    });
  }
};

// Submit quiz attempt
exports.submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeSpent } = req.body;
    
    const attempt = await QuizAttempt.findById(attemptId).populate('quiz');
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }
    
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (attempt.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Quiz already submitted'
      });
    }
    
    const quiz = attempt.quiz;
    const gradedAnswers = [];
    let totalPointsEarned = 0;
    
    // Grade each answer
    answers.forEach(userAnswer => {
      const question = quiz.questions.id(userAnswer.questionId);
      if (!question) return;
      
      let isCorrect = false;
      let pointsEarned = 0;
      
      console.log('📝 Grading question:', question.questionText);
      console.log('📝 Question type:', question.questionType);
      
      if (question.questionType === 'multiple-choice') {
        const selectedOption = question.options[userAnswer.selectedOption];
        console.log('📝 Selected option:', selectedOption?.text);
        console.log('📝 Is correct?', selectedOption?.isCorrect);
        isCorrect = selectedOption?.isCorrect || false;
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.questionType === 'true-false') {
        console.log('📝 User answer:', userAnswer.answer);
        console.log('📝 Correct answer:', question.correctAnswer);
        isCorrect = userAnswer.answer?.toLowerCase() === question.correctAnswer?.toLowerCase();
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.questionType === 'short-answer') {
        // For short answer, check if answer matches (case-insensitive)
        const correctAnswers = question.correctAnswer?.toLowerCase().split('|').map(a => a.trim()) || [];
        const userAnswerClean = userAnswer.answer?.toLowerCase().trim() || '';
        
        console.log('📝 User answer:', userAnswerClean);
        console.log('📝 Correct answers:', correctAnswers);
        
        // Check for exact match first
        isCorrect = correctAnswers.some(ans => userAnswerClean === ans);
        
        // If not exact match, check for contains (more lenient)
        if (!isCorrect && userAnswerClean.length > 3) {
          isCorrect = correctAnswers.some(ans => {
            // Check if user answer contains the correct answer or vice versa
            const contains = userAnswerClean.includes(ans) || ans.includes(userAnswerClean);
            console.log(`📝 Does "${userAnswerClean}" match "${ans}"? ${contains}`);
            return contains;
          });
        }
        
        console.log('📝 Is correct?', isCorrect);
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.questionType === 'essay') {
        // Essays need manual grading, so award 0 points initially
        pointsEarned = 0;
        isCorrect = false; // Will be graded manually
      }
      
      console.log('📝 Points earned:', pointsEarned);
      totalPointsEarned += pointsEarned;
      
      gradedAnswers.push({
        questionId: userAnswer.questionId,
        selectedOption: userAnswer.selectedOption,
        answer: userAnswer.answer,
        isCorrect,
        pointsEarned,
        timeSpent: userAnswer.timeSpent || 0
      });
    });
    
    // Calculate percentage and pass/fail
    const percentage = Math.round((totalPointsEarned / quiz.totalPoints) * 100);
    const passed = percentage >= quiz.passingScore;
    
    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.pointsEarned = totalPointsEarned;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = 'completed';
    attempt.submittedAt = new Date();
    attempt.timeSpent = timeSpent || 0;
    
    await attempt.save();
    
    res.json({
      success: true,
      message: passed ? 'Congratulations! You passed!' : 'Quiz completed',
      data: {
        attemptId: attempt._id,
        pointsEarned: totalPointsEarned,
        totalPoints: quiz.totalPoints,
        percentage,
        passed,
        passingScore: quiz.passingScore,
        answers: quiz.showCorrectAnswers ? gradedAnswers : undefined
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

// Get user's quiz attempts
exports.getUserAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const attempts = await QuizAttempt.find({
      quiz: quizId,
      user: req.user._id
    })
      .sort({ createdAt: -1 })
      .populate('quiz', 'title type totalPoints passingScore');
    
    res.json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching user attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempts',
      error: error.message
    });
  }
};

// Admin: Get all quizzes for a course
exports.getAdminCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const quizzes = await Quiz.find({ course: courseId })
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'fullName email');
    
    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching admin quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Admin: Create quiz
exports.createQuiz = async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const quiz = await Quiz.create(quizData);
    
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// Admin: Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

// Admin: Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Also delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quiz: quiz._id });
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

// Admin: Get all attempts for a quiz
exports.getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const attempts = await QuizAttempt.find({ quiz: quizId })
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email')
      .populate('quiz', 'title type');
    
    res.json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempts',
      error: error.message
    });
  }
};

