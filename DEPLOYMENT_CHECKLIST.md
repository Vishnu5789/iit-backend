# Vercel Deployment Checklist

## Pre-Deployment Checklist

- [ ] MongoDB Atlas database is set up and running
- [ ] MongoDB Atlas Network Access allows connections from `0.0.0.0/0`
- [ ] All required environment variables are prepared
- [ ] ImageKit account configured (if using image uploads)
- [ ] Razorpay account configured (if using payments)
- [ ] Code is pushed to Git repository (GitHub/GitLab/Bitbucket)

## Environment Variables to Set in Vercel

### Required Variables
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = `https://iit-frontend-ql6n.vercel.app`
- [ ] `MONGODB_URI` = `mongodb+srv://...` (your connection string)
- [ ] `JWT_SECRET` = (generate a secure random string)
- [ ] `JWT_EXPIRE` = `7d`

### Optional Variables (if using these features)
- [ ] `IMAGEKIT_PUBLIC_KEY`
- [ ] `IMAGEKIT_PRIVATE_KEY`
- [ ] `IMAGEKIT_URL_ENDPOINT`
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`

## Deployment Steps

1. [ ] Create/Login to Vercel account at https://vercel.com
2. [ ] Import Git repository in Vercel Dashboard
3. [ ] Configure project settings (Framework: Other)
4. [ ] Add all environment variables
5. [ ] Deploy project
6. [ ] Note the deployed backend URL (e.g., `https://your-app.vercel.app`)
7. [ ] Test health endpoint: `https://your-app.vercel.app/health`

## Post-Deployment Steps

1. [ ] Update frontend `VITE_API_URL` to point to new backend URL
2. [ ] Redeploy frontend with updated environment variable
3. [ ] Test API endpoints from frontend
4. [ ] Test authentication flow (login/register)
5. [ ] Test course listings
6. [ ] Test cart functionality
7. [ ] Test order creation (if applicable)
8. [ ] Test image uploads (if applicable)

## Verification Tests

### Backend Health Check
```bash
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ"
}
```

### Test API Endpoints
```bash
# Get all courses
curl https://your-backend-url.vercel.app/api/courses

# Get all blogs
curl https://your-backend-url.vercel.app/api/blogs

# Get all industries
curl https://your-backend-url.vercel.app/api/industries
```

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| 500 Error | Check Vercel logs; verify environment variables |
| Database connection failed | Check MONGODB_URI and MongoDB Atlas network access |
| CORS errors | Verify FRONTEND_URL is set correctly |
| JWT errors | Verify JWT_SECRET matches between deployments |
| Function timeout | Check database queries; consider Pro plan |

## Quick Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# View logs
vercel logs

# Check environment variables
vercel env ls
```

## Files Created for Vercel Deployment

- `vercel.json` - Vercel configuration
- `api/index.js` - Serverless function entry point
- `.vercelignore` - Files to exclude from deployment
- `.env.example` - Environment variables template
- `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `DEPLOYMENT_CHECKLIST.md` - This checklist

## Important Notes

1. **Serverless Architecture:** Vercel uses serverless functions, so each request creates a new instance
2. **Cold Starts:** First request might be slower due to cold starts
3. **Connection Pooling:** MongoDB connections are reused where possible
4. **Timeout Limits:** Hobby plan has 10s timeout, Pro plan has 60s
5. **CORS:** Frontend URL is pre-configured to `https://iit-frontend-ql6n.vercel.app`

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Node.js on Vercel: https://vercel.com/docs/runtimes#official-runtimes/node-js

