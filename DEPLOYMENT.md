# Deploying Finance Tracker to Vercel

This guide walks you through deploying your Finance Tracker application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Ensure you have a MongoDB Atlas cluster (or other cloud MongoDB)
3. **Firebase Project**: Your Firebase project should be set up with Authentication
4. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Easiest Method)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**
   
   In the Vercel dashboard, add these environment variables:
   
   **Backend Variables:**
   - `MONGO_URI` - Your MongoDB connection string
   - `FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `FIREBASE_PRIVATE_KEY` - Your Firebase private key (from service account JSON)
   - `FIREBASE_CLIENT_EMAIL` - Your Firebase client email
   - `ORIGINS` - Comma-separated allowed origins (add your Vercel frontend URL after first deployment)
   - `NODE_ENV` - Set to `production`
   
   **Frontend Variables:**
   - `VITE_API_URL` - Your backend API URL (will be `https://your-project.vercel.app/api/v1`)
   - `VITE_FIREBASE_API_KEY` - From Firebase console
   - `VITE_FIREBASE_AUTH_DOMAIN` - From Firebase console
   - `VITE_FIREBASE_PROJECT_ID` - From Firebase console
   - `VITE_FIREBASE_STORAGE_BUCKET` - From Firebase console
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` - From Firebase console
   - `VITE_FIREBASE_APP_ID` - From Firebase console

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 3: Deploy via Vercel CLI (Alternative Method)

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts to configure your project.

### Step 4: Update CORS Origins

After your first deployment:

1. Note your Vercel frontend URL (e.g., `https://your-project.vercel.app`)
2. Go to Vercel dashboard → Your Project → Settings → Environment Variables
3. Update the `ORIGINS` variable to include your frontend URL:
   ```
   https://your-project.vercel.app,http://localhost:5173
   ```
4. Redeploy the project

### Step 5: Update Frontend API URL

1. In Vercel dashboard, update `VITE_API_URL` to point to your deployed backend:
   ```
   https://your-project.vercel.app/api/v1
   ```
2. Redeploy if needed

## Project Structure

```
Financetracker/
├── vercel.json              # Root config for monorepo
├── frontend/
│   ├── .env.example         # Frontend env template
│   └── dist/                # Build output (auto-generated)
└── backend/
    ├── vercel.json          # Backend-specific config
    ├── .env.example         # Backend env template
    └── api/
        └── index.js         # Serverless function entry point
```

## How It Works

### Monorepo Deployment
- **Frontend**: Built as a static site and served from `/`
- **Backend**: Runs as serverless functions at `/api/*`
- All requests to `/api/*` are routed to the backend serverless function

### Serverless Backend
- Express app is wrapped as a Vercel serverless function
- MongoDB connections are cached to improve performance
- Each API request may trigger a "cold start" if the function hasn't been used recently

### Environment Variables
- Set in Vercel dashboard under Project Settings → Environment Variables
- Available to both frontend (build-time) and backend (runtime)

## Testing Your Deployment

1. **Frontend**: Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. **Backend Health Check**: Visit `https://your-project.vercel.app/api/v1/health` or similar endpoint
3. **Test Authentication**: Try signing up/logging in
4. **Test Transactions**: Add, view, and delete transactions

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) or add Vercel's IP ranges
- Check that `MONGO_URI` is correctly set in environment variables

### CORS Errors
- Verify `ORIGINS` includes your Vercel frontend URL
- Check that the frontend is making requests to the correct API URL

### Firebase Authentication Issues
- Ensure all Firebase environment variables are correctly set
- Verify Firebase private key is properly formatted (with newlines as `\n`)

### Cold Start Performance
- First request after inactivity may be slow (cold start)
- Consider using Vercel's "Serverless Function Warming" or upgrade to Pro plan

## Local Development

Your local development setup remains unchanged:

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

## Continuous Deployment

Once connected to Git, Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Getting Firebase Service Account Credentials

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract these values for Vercel environment variables:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
