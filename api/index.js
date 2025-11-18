require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/database');

// Initialize database connection
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    await connectDB();
    isConnected = true;
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// Serverless function handler for Vercel
module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

