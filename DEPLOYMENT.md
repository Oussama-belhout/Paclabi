# Deployment Guide - Pacman Lab

This guide will help you deploy Pacman Lab to production.

## Prerequisites

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Render](https://render.com) account
- [GitHub](https://github.com) repository

## 1. MongoDB Atlas Setup

### Create a Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account if you don't have one
3. Click "Build a Database"
4. Choose "M0 Free" tier
5. Select a cloud provider and region (preferably close to your Render region)
6. Name your cluster (e.g., "pacman-lab")
7. Click "Create Cluster"

### Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password (save these!)
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

### Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add `0.0.0.0/0`)
   - **Note**: This is required for Render to connect
4. Click "Confirm"

### Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your database user password
6. Add the database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/pacman-lab`

**Save this connection string! You'll need it for Render.**

## 2. GitHub Repository Setup

### Push Your Code

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Pacman Lab"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/pacman-lab.git

# Push to GitHub
git push -u origin main
```

### Configure Secrets for GitHub Actions

1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `RENDER_SERVICE_ID`: (You'll get this after creating Render service)
   - `RENDER_API_KEY`: (Get from Render Dashboard → Account Settings → API Keys)

## 3. Render Deployment

### Option A: Deploy from GitHub (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `pacman-lab`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install && pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Plan**: Free (or choose paid for better performance)

5. Add Environment Variables:
   - Click "Advanced" → "Add Environment Variable"
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=3000
     MONGODB_URI=<your-mongodb-connection-string>
     PYTHON_PATH=python3
     ```

6. Click "Create Web Service"

### Option B: Deploy from render.yaml

1. Ensure `render.yaml` is in your repository root
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml`
6. Add the `MONGODB_URI` environment variable
7. Click "Apply"

### Get Your Service ID

1. After deployment, go to your service dashboard on Render
2. The URL will look like: `https://dashboard.render.com/web/srv-XXXXX`
3. Copy the `srv-XXXXX` part - this is your `RENDER_SERVICE_ID`
4. Add it to GitHub Secrets (see step 2 above)

## 4. Verify Deployment

### Check Health

Once deployed, visit:
```
https://your-app-name.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test API Endpoints

```bash
# Test maze generation
curl -X POST https://your-app-name.onrender.com/api/mazes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Maze",
    "width": 10,
    "height": 10,
    "algorithm": "kruskal",
    "imperfection": 30,
    "hasPellets": true,
    "pelletAlgorithm": "strategic",
    "tunnelsH": 1,
    "tunnelsV": 0
  }'
```

## 5. Continuous Deployment

With GitHub Actions configured, every push to `main` will:
1. Run all tests (Python + JavaScript)
2. Check linting
3. Deploy to Render (if tests pass)

## 6. Custom Domain (Optional)

### On Render:

1. Go to your service dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `pacman-lab.yourdomain.com`)
4. Follow the instructions to add DNS records

## 7. Monitoring and Logs

### View Logs:

1. Render Dashboard → Your Service → "Logs" tab
2. Real-time logs of your application

### Monitor Performance:

1. Render Dashboard → Your Service → "Metrics" tab
2. CPU, Memory, and Request metrics

## Troubleshooting

### Issue: Cannot connect to MongoDB

**Solution**: 
- Check that MongoDB Atlas allows connections from `0.0.0.0/0`
- Verify your connection string is correct
- Ensure password doesn't contain special characters (URL encode if needed)

### Issue: Python scripts failing

**Solution**:
- Ensure `requirements.txt` is in repository root
- Check that Python dependencies are installing in build logs
- Verify `PYTHON_PATH=python3` is set

### Issue: Build fails

**Solution**:
- Check Render build logs for specific errors
- Ensure all dependencies are in `package.json` and `requirements.txt`
- Try building locally first

### Issue: Slow performance on free tier

**Solution**:
- Free tier services spin down after inactivity
- Consider upgrading to paid tier for production use
- First request may be slow (cold start)

## Cost Estimation

### Free Tier:
- Render Web Service: Free (with limitations)
- MongoDB Atlas M0: Free (512 MB storage)
- **Total**: $0/month

### Production Tier:
- Render Starter: $7/month (better performance, no spin-down)
- MongoDB Atlas M10: $9/month (2 GB storage, backups)
- **Total**: ~$16/month

## Support

For issues:
- Check Render docs: https://render.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
- Open an issue in your GitHub repository

## Security Checklist

- ✅ MongoDB user has minimal required permissions
- ✅ Environment variables are not committed to git
- ✅ API endpoints validate input
- ✅ MongoDB connection uses SSL/TLS
- ✅ Regular backups configured (MongoDB Atlas)
- ✅ Keep dependencies updated (`npm audit`, `pip check`)

---

**Your Pacman Lab is now deployed! 🎮🧪**

Access it at: `https://your-app-name.onrender.com`

