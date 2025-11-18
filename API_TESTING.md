# API Testing Guide

This guide provides step-by-step instructions for testing the Isaac Institute of Technology Backend API.

## Prerequisites

- Server running on `http://localhost:5000`
- API testing tool (Postman, Insomnia, Thunder Client, or curl)

## Testing Workflow

### 1. Health Check

First, verify the server is running.

**Request:**
```http
GET http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. User Registration

Create a new user account.

**Request:**
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "TestPass123",
  "confirmPassword": "TestPass123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "Test User",
      "email": "test@example.com",
      "role": "user",
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** from the response for subsequent requests.

### 3. Test Duplicate Registration

Attempt to register with the same email.

**Request:**
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "fullName": "Another User",
  "email": "test@example.com",
  "password": "TestPass123",
  "confirmPassword": "TestPass123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 4. Test Validation Errors

Try to register with invalid data.

**Request (Password too short):**
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "fullName": "Test",
  "email": "test2@example.com",
  "password": "short",
  "confirmPassword": "short"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

### 5. User Login

Log in with the created account.

**Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "fullName": "Test User",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 6. Test Invalid Login

Try to login with wrong credentials.

**Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "WrongPassword"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 7. Get Current User (Protected Route)

Get the authenticated user's information using the token.

**Request:**
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "Test User",
    "email": "test@example.com",
    "role": "user",
    "isVerified": false,
    "bio": "",
    "createdAt": "..."
  }
}
```

### 8. Test Unauthorized Access

Try to access protected route without token.

**Request:**
```http
GET http://localhost:5000/api/auth/me
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 9. Update Profile

Update the user's profile information.

**Request:**
```http
PUT http://localhost:5000/api/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "fullName": "Updated Test User",
  "bio": "I am a passionate design engineer"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "...",
    "fullName": "Updated Test User",
    "email": "test@example.com",
    "bio": "I am a passionate design engineer"
  }
}
```

### 10. Change Password

Change the user's password.

**Request:**
```http
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "TestPass123",
  "newPassword": "NewTestPass456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 11. Login with New Password

Verify the password was changed.

**Request:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "NewTestPass456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

## Postman Collection

You can import this JSON into Postman for quick testing:

```json
{
  "info": {
    "name": "IIT Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Sign Up",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPass123\",\n  \"confirmPassword\": \"TestPass123\"\n}"
            },
            "url": "{{base_url}}/api/auth/signup"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPass123\"\n}"
            },
            "url": "{{base_url}}/api/auth/login"
          }
        },
        {
          "name": "Get Me",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": "{{base_url}}/api/auth/me"
          }
        },
        {
          "name": "Update Profile",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"Updated Name\",\n  \"bio\": \"My bio\"\n}"
            },
            "url": "{{base_url}}/api/auth/profile"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

## Common Issues

### 1. MongoDB Connection Error
**Error:** `Error connecting to MongoDB`  
**Solution:** Ensure MongoDB is running and the connection string in `.env` is correct.

### 2. JWT Secret Error
**Error:** `secretOrPrivateKey must have a value`  
**Solution:** Set `JWT_SECRET` in your `.env` file.

### 3. CORS Error
**Error:** `Access to XMLHttpRequest blocked by CORS`  
**Solution:** Update `FRONTEND_URL` in `.env` to match your frontend URL.

### 4. Port Already in Use
**Error:** `EADDRINUSE: address already in use`  
**Solution:** Change the `PORT` in `.env` or stop the process using the port.

## Success Checklist

- [ ] Health check returns 200
- [ ] User can sign up successfully
- [ ] Duplicate email is rejected
- [ ] Validation errors are returned correctly
- [ ] User can login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Protected routes require authentication
- [ ] User can view their profile
- [ ] User can update their profile
- [ ] User can change password
- [ ] New password works for login

---

Happy Testing! 🚀

