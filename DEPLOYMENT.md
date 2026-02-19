# 🚀 Deployment Guide for ageGuess

This guide will help you deploy your ageGuess game to a live server. We recommend **Render** or **Railway** for easy deployment.

## 📋 Prerequisites

1. **MongoDB Atlas Account** (Free tier available)
   - Sign up at: https://www.mongodb.com/cloud/atlas/register
   - Create a free cluster
   - Get your connection string

2. **GitHub Repository** ✅ (Already done!)

## 🎯 Option 1: Deploy to Render (Recommended - Free Tier Available)

### Step 1: Create MongoDB Atlas Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Create a free cluster (M0 Sandbox)
4. Click "Connect" → "Connect your application"
5. Copy your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/ageguess?retryWrites=true&w=majority`)
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `ageguess` or your preferred database name

### Step 2: Deploy to Render

1. **Sign up for Render:**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `reddoy/ageGuess`
   - Select the repository

3. **Configure the Service:**
   - **Name:** `ageguess` (or any name you like)
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** Leave blank
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

4. **Set Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   MONGODB_URI = your_mongodb_atlas_connection_string
   PORT = 10000
   NODE_ENV = production
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be live at: `https://ageguess.onrender.com` (or your custom domain)

### Step 3: Update MongoDB Connection

Make sure your MongoDB Atlas connection string includes:
- Your database password
- Network Access: Add `0.0.0.0/0` to allow all IPs (or Render's IPs)

---

## 🚂 Option 2: Deploy to Railway (Very Easy)

### Step 1: Deploy

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `reddoy/ageGuess`
5. Railway will auto-detect Node.js

### Step 2: Set Environment Variables

1. Click on your project
2. Go to "Variables" tab
3. Add:
   ```
   MONGODB_URI = your_mongodb_atlas_connection_string
   PORT = (Railway sets this automatically)
   NODE_ENV = production
   ```

### Step 3: Get Your URL

Railway will automatically generate a URL like: `https://ageguess-production.up.railway.app`

---

## 🌐 Option 3: Deploy to Heroku (Classic Option)

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login and Deploy

```bash
# Login to Heroku
heroku login

# Create app
cd /Users/rohanomalley/Desktop/ageguess-new/ageGuess
heroku create ageguess-yourname

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Open your app
heroku open
```

---

## 🔧 Environment Variables Needed

Make sure to set these in your hosting platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ageguess` |
| `PORT` | Server port (usually auto-set) | `3000` or `10000` |
| `NODE_ENV` | Environment mode | `production` |

---

## ✅ Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Network access configured (allow all IPs: `0.0.0.0/0`)
- [ ] Environment variables set
- [ ] App deployed successfully
- [ ] Test the live URL
- [ ] Test user registration/login
- [ ] Test game functionality

---

## 🐛 Troubleshooting

### Database Connection Issues
- Check MongoDB Atlas network access settings
- Verify connection string has correct password
- Ensure database user has read/write permissions

### Port Issues
- Most platforms set PORT automatically
- Don't hardcode port numbers
- Use `process.env.PORT` (already done in server.js)

### Static Files Not Loading
- Check that `public-html` folder is in the repo
- Verify file paths are correct

---

## 🎉 You're Live!

Once deployed, share your game URL with friends and start playing!

**Recommended:** Start with **Render** - it's free, easy, and perfect for Node.js apps.
