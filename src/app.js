const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const blogRoutes = require('./routes/blogRoutes');
const industryRoutes = require('./routes/industryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const homeConfigRoutes = require('./routes/homeConfigRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const industryConfigRoutes = require('./routes/industryConfigRoutes');
const oauthRoutes = require('./routes/oauthRoutes');

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://iit-frontend-ql6n.vercel.app',
  'https://iit-frontend-ql6n-git-master-vishnus-projects-731f8db2.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                      origin.includes('vercel.app') || 
                      origin.includes('isaactechie.com') ||
                      origin.startsWith('http://localhost');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes); // OAuth routes
app.use('/api/courses', courseRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/industries', industryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/home-config', homeConfigRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/industry', industryConfigRoutes);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;

