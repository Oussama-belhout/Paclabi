/**
 * Maze Controller
 * Handles maze generation, retrieval, rating, and deletion
 */

const Maze = require('../models/Maze');
const pythonBridge = require('../services/pythonBridge');
const mongoose = require('mongoose');

// In-memory storage for demo mode
const demoStorage = {
  mazes: [],
  nextId: 1
};

/**
 * Generate a new maze
 * POST /api/mazes
 */
exports.generateMaze = async (req, res) => {
  try {
    const {
      name,
      width,
      height,
      algorithm = 'kruskal',
      imperfection = 0,
      tunnelsH = 1,
      tunnelsV = 0,
      hasPellets = false,
      pelletAlgorithm = 'strategic'
    } = req.body;

    // Validate required fields
    if (!name || !width || !height) {
      return res.status(400).json({
        error: 'Missing required fields: name, width, height'
      });
    }

    // Generate maze using Python
    const mazeResult = await pythonBridge.generateMaze(
      width, height, algorithm, imperfection, tunnelsH, tunnelsV
    );

    let grid = mazeResult.grid;

    // Place pellets if requested
    if (hasPellets && pelletAlgorithm) {
      const pelletResult = await pythonBridge.placePellets(grid, pelletAlgorithm);
      grid = pelletResult.grid;
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode - use in-memory storage
      const maze = {
        _id: `demo-${demoStorage.nextId++}`,
        name,
        config: {
          width,
          height,
          algorithm,
          imperfection,
          hasPellets,
          pelletAlgorithm: hasPellets ? pelletAlgorithm : null,
          tunnels: {
            horizontal: tunnelsH,
            vertical: tunnelsV
          }
        },
        grid,
        rating: { user: null, core: null, metrics: {} },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      demoStorage.mazes.push(maze);
      
      return res.status(201).json({
        message: 'Maze generated successfully (DEMO MODE - not saved to database)',
        maze,
        demoMode: true
      });
    }

    // Normal mode - save to database
    const maze = new Maze({
      name,
      config: {
        width,
        height,
        algorithm,
        imperfection,
        hasPellets,
        pelletAlgorithm: hasPellets ? pelletAlgorithm : null,
        tunnels: {
          horizontal: tunnelsH,
          vertical: tunnelsV
        }
      },
      grid
    });

    await maze.save();

    res.status(201).json({
      message: 'Maze generated successfully',
      maze
    });
  } catch (error) {
    console.error('Error generating maze:', error);
    res.status(500).json({
      error: 'Failed to generate maze',
      details: error.message
    });
  }
};

/**
 * Get all mazes
 * GET /api/mazes
 */
exports.getAllMazes = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode - return in-memory mazes
      return res.json({
        mazes: demoStorage.mazes.slice(0, parseInt(limit)),
        pagination: {
          total: demoStorage.mazes.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(demoStorage.mazes.length / limit)
        },
        demoMode: true
      });
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const mazes = await Maze.find()
      .select('-grid') // Exclude large grid data in list view
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Maze.countDocuments();

    res.json({
      mazes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching mazes:', error);
    res.status(500).json({
      error: 'Failed to fetch mazes',
      details: error.message
    });
  }
};

/**
 * Get a single maze by ID
 * GET /api/mazes/:id
 */
exports.getMazeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      const maze = demoStorage.mazes.find(m => m._id === id);
      if (!maze) {
        return res.status(404).json({ error: 'Maze not found' });
      }
      return res.json({ maze, demoMode: true });
    }

    const maze = await Maze.findById(id);

    if (!maze) {
      return res.status(404).json({
        error: 'Maze not found'
      });
    }

    res.json({ maze });
  } catch (error) {
    console.error('Error fetching maze:', error);
    res.status(500).json({
      error: 'Failed to fetch maze',
      details: error.message
    });
  }
};

/**
 * Update maze rating
 * PUT /api/mazes/:id/rating
 */
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { userRating } = req.body;

    if (!userRating || userRating < 1 || userRating > 5) {
      return res.status(400).json({
        error: 'User rating must be between 1 and 5'
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      const maze = demoStorage.mazes.find(m => m._id === id);
      if (!maze) {
        return res.status(404).json({ error: 'Maze not found' });
      }
      maze.rating.user = userRating;
      return res.json({ message: 'Rating updated (demo mode)', maze, demoMode: true });
    }

    const maze = await Maze.findById(id);

    if (!maze) {
      return res.status(404).json({
        error: 'Maze not found'
      });
    }

    maze.rating.user = userRating;
    await maze.save();

    res.json({
      message: 'Rating updated successfully',
      maze
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      error: 'Failed to update rating',
      details: error.message
    });
  }
};

/**
 * Delete a maze
 * DELETE /api/mazes/:id
 */
exports.deleteMaze = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      const index = demoStorage.mazes.findIndex(m => m._id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Maze not found' });
      }
      demoStorage.mazes.splice(index, 1);
      return res.json({ message: 'Maze deleted (demo mode)', demoMode: true });
    }

    const maze = await Maze.findByIdAndDelete(id);

    if (!maze) {
      return res.status(404).json({
        error: 'Maze not found'
      });
    }

    res.json({
      message: 'Maze deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maze:', error);
    res.status(500).json({
      error: 'Failed to delete maze',
      details: error.message
    });
  }
};
