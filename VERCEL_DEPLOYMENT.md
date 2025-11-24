# Vercel Deployment Guide for IIT Backend

This guide will help you deploy the Isaac Institute of Technology backend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed (optional, but recommended)
3. MongoDB Atlas account with a database set up
4. All required API keys (ImageKit, Razorpay, etc.)

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

Before deploying, you need to set up your environment variables in Vercel. You can do this either through the Vercel Dashboard or CLI.

#### Required Environment Variables:

- `NODE_ENV` - Set to `production`
- `FRONTEND_URL` - Your frontend URL: `https://iit-frontend-ql6n.vercel.app`
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key (use a strong, random string)
- `JWT_EXPIRE` - JWT expiration time (e.g., `7d`)

#### Optional Environment Variables (for additional features):

- `IMAGEKIT_PUBLIC_KEY` - For image upload functionality
- `IMAGEKIT_PRIVATE_KEY` - For image upload functionality
- `IMAGEKIT_URL_ENDPOINT` - For image upload functionality
- `RAZORPAY_KEY_ID` - For payment processing
- `RAZORPAY_KEY_SECRET` - For payment processing

### 4. Deploy via Vercel Dashboard (Recommended for first-time deployment)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure your project:
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
5. Add all environment variables in the "Environment Variables" section
6. Click "Deploy"

### 5. Deploy via CLI (Alternative method)

From your project root directory:

```bash
# First deployment
vercel

# Follow the prompts and select your configuration options

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_EXPIRE
vercel env add FRONTEND_URL
# ... add other variables as needed

# Deploy to production
vercel --prod
```

### 6. Update Frontend Configuration

After deployment, you'll receive a Vercel URL for your backend (e.g., `https://your-backend-name.vercel.app`).

Update your frontend environment variables to point to this new backend URL:

```env
VITE_API_URL=https://your-backend-name.vercel.app
```

Redeploy your frontend after updating this configuration.

## Post-Deployment

### Verify Deployment

1. Check the health endpoint:
   ```
   https://your-backend-name.vercel.app/health
   ```

2. Test API endpoints:
   ```
   https://your-backend-name.vercel.app/api/courses
   https://your-backend-name.vercel.app/api/blogs
   ```

### MongoDB Atlas Configuration

Make sure your MongoDB Atlas cluster allows connections from anywhere (or specifically from Vercel):

1. Go to MongoDB Atlas Dashboard
2. Navigate to "Network Access"
3. Add IP Address: `0.0.0.0/0` (allows all IPs)
   - Note: For better security, you can allowlist specific Vercel IP ranges

### Custom Domain (Optional)

To use a custom domain:

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Verify `MONGODB_URI` is correctly set in Vercel environment variables
   - Check MongoDB Atlas network access settings
   - Ensure database user credentials are correct

2. **CORS Errors:**
   - Verify `FRONTEND_URL` matches your actual frontend URL
   - Check that CORS configuration in `src/app.js` includes your frontend domain

3. **JWT Token Errors:**
   - Ensure `JWT_SECRET` is the same as used in development
   - Verify `JWT_EXPIRE` format is correct (e.g., `7d`, `24h`)

4. **Function Timeout:**
   - Vercel has a 10-second timeout for Hobby plan
   - Consider upgrading to Pro plan for longer timeouts if needed

### View Logs

```bash
# View real-time logs
vercel logs

# Or view logs in the Vercel Dashboard
```

## Environment Variables Reference

Create a `.env` file locally with these variables (use `.env.example` as template):

```env
NODE_ENV=production
FRONTEND_URL=https://iit-frontend-ql6n.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secure_random_jwt_secret_here
JWT_EXPIRE=7d
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Continuous Deployment

Once connected to Git, Vercel will automatically deploy:
- **Production:** Pushes to `main` or `master` branch
- **Preview:** Pushes to other branches

## Support

For issues specific to Vercel deployment, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/runtimes#official-runtimes/node-js)

For application-specific issues, refer to the main README.md and SETUP_GUIDE.md files.

