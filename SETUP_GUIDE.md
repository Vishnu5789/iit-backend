# Complete Setup Guide - Isaac Institute of Technology

This guide will walk you through setting up both the frontend and backend applications from scratch.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
3. **npm** or **yarn** package manager
4. **Git** (optional, for version control)

## 🚀 Quick Start

### Step 1: Install and Start MongoDB

#### macOS (using Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify MongoDB is running
mongosh
```

#### Windows
```bash
# Download MongoDB from https://www.mongodb.com/try/download/community
# Install and start MongoDB as a service
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\X.X\bin\mongod.exe"
```

#### Linux (Ubuntu/Debian)
```bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

### Step 2: Set Up Backend

```bash
# Navigate to backend directory
cd /Users/vishnum/Downloads/iit-backend

# Install dependencies (already done, but if needed)
npm install

# The .env file is already created, but verify it contains:
cat .env

# Start the backend server in development mode
npm run dev
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Isaac Institute of Technology - Backend API        ║
║                                                          ║
║   Server running on port: 5000                          ║
║   Environment: development                              ║
║   API Base URL: http://localhost:5000                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
✅ MongoDB Connected: localhost
```

### Step 3: Set Up Frontend

Open a **new terminal window** and:

```bash
# Navigate to frontend directory
cd /Users/vishnum/Downloads/iit-frontend

# Dependencies are already installed, but if needed
npm install

# Create .env file for frontend
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5000/api
EOF

# Start the frontend development server
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Access the Application

1. Open your browser and go to: **http://localhost:5173**
2. Click on "Sign Up" button in the navbar
3. Fill in the registration form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPass123
   - Confirm Password: TestPass123
4. Click "Create Account"
5. You'll be automatically logged in and redirected to the home page

## 🧪 Testing the Integration

### Test Signup Flow

1. Go to http://localhost:5173/signup
2. Create a new account
3. Check the browser console for success messages
4. Check the backend terminal for API logs

### Test Login Flow

1. Go to http://localhost:5173/login
2. Enter your credentials
3. Click "Sign In"
4. You should be redirected to the home page

### Verify Backend Database

```bash
# Connect to MongoDB
mongosh

# Use the database
use iit-platform

# View created users
db.users.find().pretty()

# You should see your created user with hashed password
```

## 📡 Testing API Directly

You can test the backend API directly using curl:

```bash
# Health check
curl http://localhost:5000/health

# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "API Test User",
    "email": "apitest@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'

# Login (save the token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "TestPass123"
  }'

# Get current user (replace YOUR_TOKEN with actual token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Common Issues and Solutions

### Issue 1: MongoDB Connection Error

**Error:** `Error connecting to MongoDB: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Issue 2: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or change the port in backend/.env
PORT=5001
```

### Issue 3: CORS Error in Frontend

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
- Verify backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env` matches frontend URL
- Restart both servers

### Issue 4: JWT Secret Error

**Error:** `secretOrPrivateKey must have a value`

**Solution:**
```bash
# Ensure JWT_SECRET is set in backend/.env
echo "JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024" >> .env
```

### Issue 5: Frontend API Connection Failed

**Error:** `Failed to fetch` or `Network error`

**Solution:**
1. Check if backend is running: `curl http://localhost:5000/health`
2. Verify `VITE_API_URL` in frontend `.env`
3. Restart frontend: `npm run dev`

## 📁 Project Structure Overview

```
/Users/vishnum/Downloads/
├── iit-frontend/              # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/            # Login, SignUp, Home, etc.
│   │   ├── components/       # Navbar, etc.
│   │   ├── services/         # API integration
│   │   └── App.tsx           # Main app component
│   ├── .env                  # Frontend environment variables
│   └── package.json
│
└── iit-backend/              # Node.js + Express + MongoDB
    ├── src/
    │   ├── config/           # Database configuration
    │   ├── controllers/      # Business logic
    │   ├── models/          # Database models
    │   ├── routes/          # API routes
    │   ├── middleware/      # Auth, validation, error handling
    │   ├── utils/           # Helper functions
    │   └── server.js        # Entry point
    ├── .env                 # Backend environment variables
    └── package.json
```

## 🎯 Next Steps

1. **Customize the Application**
   - Modify color scheme in `frontend/src/index.css`
   - Add more user fields in `backend/src/models/User.js`
   - Create additional pages and features

2. **Add More Features**
   - Email verification
   - Password reset functionality
   - User profile page
   - Course management
   - Payment integration

3. **Deploy to Production**
   - Frontend: Vercel, Netlify, or Render
   - Backend: Railway, Render, or Heroku
   - Database: MongoDB Atlas

4. **Implement Security Enhancements**
   - Rate limiting
   - Input sanitization
   - HTTPS in production
   - Strong JWT secrets
   - Environment-specific configurations

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [JWT.io](https://jwt.io/) - Learn about JSON Web Tokens

## 🆘 Getting Help

If you encounter any issues:

1. Check the terminal logs for both frontend and backend
2. Review the API_TESTING.md file for endpoint examples
3. Check MongoDB connection: `mongosh`
4. Verify all environment variables are set correctly
5. Ensure all dependencies are installed

## ✅ Verification Checklist

- [ ] MongoDB is installed and running
- [ ] Backend server starts without errors (port 5000)
- [ ] Frontend dev server starts without errors (port 5173)
- [ ] Can access http://localhost:5173 in browser
- [ ] Can create a new account via Sign Up page
- [ ] Can login with created account
- [ ] User data is saved in MongoDB
- [ ] JWT token is generated and stored in localStorage
- [ ] API health check returns success: http://localhost:5000/health

---

**Congratulations! 🎉**

You now have a fully functional authentication system with:
- Beautiful, modern UI with Tailwind CSS
- Secure password hashing with bcrypt
- JWT-based authentication
- MongoDB database integration
- Form validation on both frontend and backend
- Error handling and user feedback
- Protected routes and middleware

Happy coding! 🚀

