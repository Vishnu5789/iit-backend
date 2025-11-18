# Isaac Institute of Technology - Backend API

A robust Node.js backend API for the Isaac Institute of Technology learning platform, providing authentication, user management, and course-related functionality.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT
- **Password Security**: Bcrypt password hashing with salt rounds
- **Input Validation**: Comprehensive request validation using express-validator
- **Error Handling**: Centralized error handling middleware
- **Database**: MongoDB with Mongoose ODM
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Configuration management with dotenv
- **Security**: Protected routes with JWT authentication middleware

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (v4.4 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd iit-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/iit-platform
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

5. **Run the application**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Sign Up
Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Requirements:**
- Full name: 2-50 characters
- Email: Valid email format
- Password: Minimum 8 characters, must contain uppercase, lowercase, and number
- Passwords must match

#### 2. Login
Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Current User
Get the currently authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "bio": "",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 4. Update Profile
Update user profile information.

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "bio": "Passionate design engineer",
  "profileImage": "https://example.com/image.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Updated Doe",
    "email": "john@example.com",
    "role": "user",
    "bio": "Passionate design engineer",
    "profileImage": "https://example.com/image.jpg"
  }
}
```

#### 5. Change Password
Change the user's password.

**Endpoint:** `PUT /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Health Check

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

Token expiration is configured via the `JWT_EXPIRE` environment variable (default: 7 days).

## 📁 Project Structure

```
iit-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection configuration
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── validation.js        # Request validation middleware
│   ├── models/
│   │   └── User.js              # User data model
│   ├── routes/
│   │   └── authRoutes.js        # Authentication routes
│   ├── utils/
│   │   └── generateToken.js     # JWT token utilities
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Project dependencies
└── README.md                    # Documentation
```

## 🛡️ Error Handling

All errors are handled by the centralized error handling middleware and return responses in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing the API

You can test the API using tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)
- [curl](https://curl.se/)

Example curl request:
```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Get current user (replace <TOKEN> with actual token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRE` | Token expiration time | 7d | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 | No |

## 🚀 Deployment

### Deploying to Production

1. Set `NODE_ENV=production` in your environment variables
2. Use a strong, random `JWT_SECRET`
3. Configure your MongoDB connection string
4. Use a process manager like [PM2](https://pm2.keymetrics.io/)

```bash
npm install -g pm2
pm2 start src/server.js --name iit-backend
pm2 save
pm2 startup
```

### Recommended Hosting Platforms
- [Heroku](https://www.heroku.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [DigitalOcean](https://www.digitalocean.com/)
- [AWS EC2](https://aws.amazon.com/ec2/)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@isaactech.edu or create an issue in the repository.

---

**Built with ❤️ by the Isaac Institute of Technology Team**

