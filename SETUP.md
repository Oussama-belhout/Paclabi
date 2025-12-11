# Pacman Lab - Setup Instructions

Complete setup guide for local development and deployment.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [External Services Setup](#external-services-setup)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## Prerequisites

### Required Software

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/downloads/))
- **MongoDB** (Local or Atlas account)
- **Git** ([Download](https://git-scm.com/))

### Verify Installation

```bash
node --version  # Should be v18.x.x or higher
python --version  # Should be 3.9.x or higher
git --version
```

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd pacman-lab
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create Environment File

Create a `.env` file in the project root:

```bash
# Copy the example
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000

# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/pacman-lab

# For MongoDB Atlas (recommended)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pacman-lab

PYTHON_PATH=python3
CORS_ORIGIN=*
```

---

## External Services Setup

### MongoDB Setup

#### Option A: Local MongoDB (Development)

1. **Install MongoDB Community Edition**
   - Windows: [Download MongoDB](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [official guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB**
   ```bash
   # Windows (as service - usually automatic)
   net start MongoDB
   
   # Mac/Linux
   brew services start mongodb-community  # Mac
   sudo systemctl start mongod            # Linux
   ```

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # Should connect successfully
   ```

#### Option B: MongoDB Atlas (Production/Recommended)

See [DEPLOYMENT.md](DEPLOYMENT.md#1-mongodb-atlas-setup) for detailed MongoDB Atlas setup instructions.

**Quick Steps:**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (M0 Free tier)
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for Render)
5. Get connection string
6. Update `.env` with connection string

### GitHub Actions (CI/CD)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Configure Secrets** (for deployment)
   - Go to Repository Settings → Secrets → Actions
   - Add secrets:
     - `RENDER_SERVICE_ID`
     - `RENDER_API_KEY`

### Render Deployment

See complete deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Running the Application

### Development Mode

```bash
# Start server with auto-reload
npm run dev
```

The application will be available at: `http://localhost:3000`

### Production Mode

```bash
npm start
```

### Running Python Scripts Directly

```bash
# Generate a maze
python src/algorithms/main.py generate 24 15 --algorithm kruskal --imperfection 30

# Place pellets
python src/algorithms/main.py pellets --grid-json '[[0,1,0]]' --algorithm strategic
```

---

## Testing

### Run All Tests

```bash
# JavaScript tests
npm test

# Python tests
npm run test:python

# Or directly with pytest
pytest tests/algorithms -v
```

### Run Tests with Coverage

```bash
# JavaScript
npm test -- --coverage

# Python
pytest tests/algorithms --cov=src/algorithms --cov-report=html
```

### Run Specific Tests

```bash
# Test specific file
npm test -- tests/server/maze.test.js

# Test specific Python module
pytest tests/algorithms/test_pathfinding.py -v

# Run tests matching pattern
pytest tests/algorithms -k "test_astar"
```

### Linting

```bash
# JavaScript linting
npm run lint

# Python linting
pylint src/algorithms
```

---

## Project Structure

```
pacman-lab/
├── src/
│   ├── algorithms/          # Python algorithms
│   │   ├── maze/           # Maze generation
│   │   ├── pathfinding/    # A*, BFS
│   │   ├── ghost_ai/       # Ghost behaviors
│   │   ├── simulation/     # Game engine
│   │   └── utils/          # Utilities
│   ├── server/             # Node.js backend
│   │   ├── config/         # Configuration
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # Python bridge
│   │   └── middleware/     # Express middleware
│   └── client/             # Frontend
│       ├── css/            # Styles
│       ├── js/             # JavaScript
│       │   ├── api/        # API clients
│       │   ├── components/ # UI components
│       │   └── game/       # Game engine
│       └── assets/         # Images, sounds
├── tests/                  # Unit & integration tests
├── data/                   # Local data storage
├── .github/workflows/      # CI/CD pipelines
└── docs/                   # Documentation
```

---

## API Endpoints

### Mazes
- `POST /api/mazes` - Generate maze
- `GET /api/mazes` - List mazes
- `GET /api/mazes/:id` - Get maze
- `PUT /api/mazes/:id/rating` - Update rating
- `DELETE /api/mazes/:id` - Delete maze

### Trajectories
- `POST /api/trajectories` - Save trajectory
- `GET /api/trajectories` - List trajectories
- `GET /api/trajectories/:id` - Get trajectory

### Simulations
- `POST /api/simulations` - Run simulation
- `GET /api/simulations` - List simulations
- `GET /api/simulations/:id` - Get simulation
- `GET /api/simulations/:id/replay` - Get replay frames

### Health
- `GET /api/health` - Health check

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000

# Kill the process or change PORT in .env
```

### MongoDB Connection Errors

1. Check MongoDB is running: `mongosh`
2. Verify connection string in `.env`
3. Check firewall/network settings
4. For Atlas: Verify IP whitelist

### Python Module Not Found

```bash
# Reinstall dependencies
pip install -r requirements.txt

# Verify Python path
which python3  # Mac/Linux
where python   # Windows
```

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Development Tips

### Hot Reload

- Backend: Use `npm run dev` (nodemon watches for changes)
- Frontend: No build step needed (vanilla JS)

### Debugging

**Node.js:**
```bash
# Add to package.json scripts
"debug": "node --inspect src/server/index.js"

# Run and attach debugger (VS Code, Chrome DevTools)
npm run debug
```

**Python:**
```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Run script
python src/algorithms/main.py generate 10 10
```

### Database GUI Tools

- [MongoDB Compass](https://www.mongodb.com/products/compass) - Official MongoDB GUI
- [Studio 3T](https://studio3t.com/) - Advanced MongoDB client

---

## Next Steps

1. ✅ Complete local setup
2. ✅ Run tests to verify installation
3. ✅ Start development server
4. ✅ Generate your first maze
5. ✅ Deploy to production (see [DEPLOYMENT.md](DEPLOYMENT.md))

---

## Support & Resources

- **Documentation**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **MongoDB Docs**: https://docs.mongodb.com
- **Render Docs**: https://render.com/docs
- **GitHub Actions**: https://docs.github.com/actions

---

**Happy Coding! 🎮🧪**

