# 🗄️ MongoDB Atlas Setup Guide for Pacman Lab

**Time Required: 10 minutes**  
**Cost: FREE (M0 tier)**

This guide will walk you through setting up MongoDB Atlas so your Pacman Lab can save data permanently.

---

## 📋 Step-by-Step Instructions

### Step 1: Create MongoDB Atlas Account (2 minutes)

1. **Go to MongoDB Atlas**  
   Visit: https://www.mongodb.com/cloud/atlas

2. **Sign Up**
   - Click "Try Free" button
   - **Quick option**: Sign up with Google account (faster!)
   - Or use email/password

3. **Verify your email** (if using email signup)

---

### Step 2: Create Your First Cluster (3 minutes)

1. **After logging in**, you'll see "Create a Cluster" or "Build a Database"
   - Click **"Build a Database"**

2. **Choose FREE Tier**
   - Select **"M0 FREE"** (Shared cluster)
   - This gives you 512MB storage - perfect for your project!

3. **Choose Cloud Provider & Region**
   - **Provider**: AWS, Google Cloud, or Azure (any works)
   - **Region**: Choose one close to you for better speed
     - Europe: Frankfurt, Paris, or London
     - US: N. Virginia or Oregon
   - Click **"Create Cluster"**

4. **Wait 3-5 minutes** for cluster to deploy
   - You'll see a progress bar
   - Grab a coffee! ☕

---

### Step 3: Create Database User (1 minute)

1. **Security Quickstart** will appear automatically

2. **Add a Database User**
   - Username: Choose something simple (e.g., `pacman_admin`)
   - Password: Click "Autogenerate Secure Password" 
   - **⚠️ IMPORTANT**: Click "Copy" to save your password!
   - Or create your own password (save it!)

3. **Click "Create User"**

---

### Step 4: Configure Network Access (1 minute)

1. **Add Your IP Address**
   - You'll see "Where would you like to connect from?"
   - Click **"Add My Current IP Address"** (for development)
   
2. **For Render deployment** (production):
   - Also add: `0.0.0.0/0` (Allow access from anywhere)
   - Click "Add Entry"

3. **Click "Finish and Close"**

---

### Step 5: Get Connection String (2 minutes)

1. **Click "Connect" button** on your cluster

2. **Choose connection method**
   - Click **"Connect your application"**

3. **Copy the connection string**
   - You'll see something like:
   ```
   mongodb+srv://pacman_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

4. **Replace `<password>`** with your actual password
   - Example result:
   ```
   mongodb+srv://pacman_admin:MySecurePass123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Add database name** at the end (before the `?`):
   ```
   mongodb+srv://pacman_admin:MySecurePass123@cluster0.xxxxx.mongodb.net/pacman-lab?retryWrites=true&w=majority
   ```

---

### Step 6: Update Your .env File (1 minute)

1. **Open your `.env` file** in the project root:
   ```
   C:\Users\belho\OneDrive\Documents\UNICA M1 COURSES\TER\PacLab\.env
   ```

2. **Replace the MONGODB_URI line**
   
   **Before:**
   ```
   MONGODB_URI=mongodb://localhost:27017/pacman-lab
   ```
   
   **After:**
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pacman-lab?retryWrites=true&w=majority
   ```
   
   ⚠️ **Use your actual connection string!**

3. **Save the file**

---

### Step 7: Restart Your Application

**In your terminal:**

```bash
# Stop the server (Ctrl+C or)
# Then restart:
npm start
```

**Or just close and restart from your IDE!**

---

## ✅ Verification

Once restarted, you should see in the terminal:

```
✅ MongoDB connected successfully
📊 Database: pacman-lab
🚀 Pacman Lab server running on port 3000
```

If you see this - **SUCCESS!** Your data will now be saved permanently! 🎉

---

## 🎯 What You'll Get

### With MongoDB Connected:

- ✅ **Mazes persist** - Saved forever, not just in memory
- ✅ **Trajectories persist** - All your recorded games saved
- ✅ **Simulations persist** - Full replay data with:
  - Trajectory reference
  - Maze metadata
  - Ghost configurations (types, algorithms, start positions)
  - Results (caught/escaped, catch time, catch position)
  - All frame data for replay
- ✅ **Browse history** - See all your previous work
- ✅ **Production ready** - Works on Render deployment

---

## 🆘 Troubleshooting

### Error: "Authentication failed"
- **Solution**: Double-check username and password in connection string
- Ensure password doesn't have special characters (or URL-encode them)

### Error: "Connection timeout"
- **Solution**: Check Network Access settings
- Ensure `0.0.0.0/0` is added to IP whitelist

### Error: "Database not found"
- **Solution**: MongoDB will auto-create the database on first write
- This is normal - don't worry!

### Can't find .env file
- **Location**: Project root folder
- Create it if missing (copy from `.env.example`)

---

## 📊 What Gets Saved in Database

### **Mazes Collection:**
```json
{
  "_id": "ObjectId",
  "name": "My Awesome Maze",
  "config": {
    "width": 24,
    "height": 15,
    "algorithm": "kruskal",
    "imperfection": 30,
    "hasPellets": true,
    "pelletAlgorithm": "strategic",
    "tunnels": { "horizontal": 1, "vertical": 0 }
  },
  "grid": [[1,0,1,...]],
  "rating": { "user": 5, "core": null },
  "createdAt": "2024-12-11T...",
  "updatedAt": "2024-12-11T..."
}
```

### **Trajectories Collection:**
```json
{
  "_id": "ObjectId",
  "name": "Epic Run #1",
  "mazeId": "ObjectId (reference)",
  "moves": [
    {
      "position": {"x": 1, "y": 1},
      "direction": "RIGHT",
      "timestamp": 0,
      "pelletsEaten": 0
    },
    ...
  ],
  "duration": 45000,
  "pelletsCollected": 150,
  "totalPellets": 200,
  "createdAt": "2024-12-11T..."
}
```

### **Simulations Collection:**
```json
{
  "_id": "ObjectId",
  "name": "Ghost Test #1",
  "trajectoryId": "ObjectId (reference)",
  "mazeId": "ObjectId (reference)",
  "ghostConfigs": [
    {
      "ghostType": "blinky",
      "algorithm": "astar",
      "startPosition": {"x": 1, "y": 1}
    },
    ...
  ],
  "results": {
    "caught": true,
    "catchPosition": {"x": 15, "y": 8},
    "catchTime": 12500,
    "caughtByGhost": "blinky",
    "totalFrames": 125,
    "frames": [...]
  },
  "createdAt": "2024-12-11T..."
}
```

---

## 💰 Cost

- **Development (M0)**: FREE forever
  - 512 MB storage
  - Shared CPU
  - Perfect for your project!

- **Production (M10)**: $9/month (optional)
  - 2 GB storage
  - Dedicated resources
  - Automated backups

**For your semester project: FREE tier is perfect!** ✅

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` file** to git (already in `.gitignore`)
2. ✅ **Use strong passwords** for database users
3. ✅ **Restrict IP access** in production (whitelist specific IPs)
4. ✅ **Regular backups** (automatic on paid tiers)

---

## 📱 MongoDB Atlas Mobile App

- Available on iOS and Android
- Monitor your database on the go
- View collections and documents

---

## 🎓 After Setup Complete

Once MongoDB is connected, test the full workflow:

1. **Generate** a maze → **Saves to database** ✅
2. **Play** the maze → **Record trajectory** ✅
3. **Save** trajectory → **Persists forever** ✅
4. **Run simulation** → **Saves results with metadata** ✅
5. **View history** → **Browse all saved data** ✅

---

## 🚀 Quick Setup Checklist

- [ ] Create MongoDB Atlas account
- [ ] Create M0 FREE cluster
- [ ] Create database user (save password!)
- [ ] Allow IP access (0.0.0.0/0)
- [ ] Copy connection string
- [ ] Update `.env` file
- [ ] Restart server (`npm start`)
- [ ] See "✅ MongoDB connected successfully"

---

**That's it! Your Pacman Lab will now save everything permanently!** 🎉

**Estimated setup time: 10 minutes**  
**Need help?** Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com/getting-started/

