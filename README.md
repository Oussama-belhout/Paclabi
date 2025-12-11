# Pacman Lab 🎮🧪

A comprehensive platform for studying the theoretical aspects and algorithms behind the Pacman game.

## Features

- **Maze Generation**: Generate mazes using state-of-the-art algorithms (Kruskal, Prim, Recursive Backtracker, Wilson)
- **Pellet Placement**: Strategic pellet distribution with multiple algorithms
- **Manual Evaluation**: Rate and save mazes with a star-rating interface
- **Gameplay Recording**: Play with keyboard controls and record trajectories
- **Ghost AI Simulation**: Run recorded games with configurable ghost behaviors using A* pathfinding
- **MongoDB Storage**: Persistent storage for mazes, trajectories, and simulations

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Algorithms**: Python 3.x (NumPy, Matplotlib)
- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Testing**: Jest (JS) + Pytest (Python)
- **CI/CD**: GitHub Actions
- **Deployment**: Render

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Installation

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI
```

### Running Locally

```bash
# Start the server
npm start

# Development mode with auto-reload
npm run dev

# Run tests
npm test
npm run test:python
```

Open http://localhost:3000 in your browser.

## Project Structure

```
src/
├── server/          # Express API
├── algorithms/      # Python algorithms
└── client/          # Frontend
tests/               # Unit & integration tests
```

## Algorithms

### Maze Generation
- **Kruskal's Algorithm**: Randomized minimum spanning tree
- **Prim's Algorithm**: Organic-looking mazes
- **Recursive Backtracker**: Long winding corridors
- **Wilson's Algorithm**: Unbiased uniform spanning trees

### Pathfinding (Ghost AI)
- **A* with Manhattan Distance**: Optimal grid-based pathfinding
- **BFS**: Shortest path for simple behaviors

### Pellet Placement
- **Strategic**: Based on dead-ends and path complexity
- **Random**: Uniform distribution
- **Classic**: Pac-Man style layout

## API Documentation

### Maze Endpoints
- `POST /api/mazes` - Generate and save a maze
- `GET /api/mazes` - List all mazes
- `GET /api/mazes/:id` - Get specific maze
- `PUT /api/mazes/:id/rating` - Update maze rating
- `DELETE /api/mazes/:id` - Delete maze

### Trajectory Endpoints
- `POST /api/trajectories` - Save recorded gameplay
- `GET /api/trajectories` - List trajectories
- `GET /api/trajectories/:id` - Get specific trajectory

### Simulation Endpoints
- `POST /api/simulations` - Run ghost simulation
- `GET /api/simulations/:id` - Get simulation results

## Testing

```bash
# JavaScript tests
npm test

# Python tests
npm run test:python

# With coverage
npm test -- --coverage
pytest --cov=src/algorithms
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for Render and MongoDB Atlas setup.

## License

MIT

