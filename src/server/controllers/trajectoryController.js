/**
 * Trajectory Controller
 * Handles recording and retrieval of Pacman gameplay trajectories
 */

const Trajectory = require('../models/Trajectory');
const Maze = require('../models/Maze');
const mongoose = require('mongoose');

// In-memory storage for demo mode
const demoStorage = {
  trajectories: [],
  nextId: 1
};

/**
 * Save a new trajectory
 * POST /api/trajectories
 */
exports.saveTrajectory = async (req, res) => {
  try {
    const {
      name,
      mazeId,
      moves,
      duration,
      pelletsCollected,
      totalPellets
    } = req.body;

    // Validate required fields
    if (!name || !mazeId || !moves || !duration) {
      return res.status(400).json({
        error: 'Missing required fields: name, mazeId, moves, duration'
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      const trajectory = {
        _id: `demo-traj-${demoStorage.nextId++}`,
        name,
        mazeId,
        moves,
        duration,
        pelletsCollected: pelletsCollected || 0,
        totalPellets: totalPellets || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      demoStorage.trajectories.push(trajectory);
      
      return res.status(201).json({
        message: 'Trajectory saved successfully (DEMO MODE)',
        trajectory,
        demoMode: true
      });
    }

    // Verify maze exists
    const maze = await Maze.findById(mazeId);
    if (!maze) {
      return res.status(404).json({
        error: 'Maze not found'
      });
    }

    // Create trajectory
    const trajectory = new Trajectory({
      name,
      mazeId,
      moves,
      duration,
      pelletsCollected: pelletsCollected || 0,
      totalPellets: totalPellets || 0
    });

    await trajectory.save();

    res.status(201).json({
      message: 'Trajectory saved successfully',
      trajectory
    });
  } catch (error) {
    console.error('Error saving trajectory:', error);
    res.status(500).json({
      error: 'Failed to save trajectory',
      details: error.message
    });
  }
};

/**
 * Get all trajectories
 * GET /api/trajectories
 */
exports.getAllTrajectories = async (req, res) => {
  try {
    const { page = 1, limit = 20, mazeId } = req.query;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      return res.json({
        trajectories: demoStorage.trajectories.slice(0, parseInt(limit)),
        pagination: {
          total: demoStorage.trajectories.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(demoStorage.trajectories.length / limit)
        },
        demoMode: true
      });
    }

    const filter = mazeId ? { mazeId } : {};
    const skip = (page - 1) * limit;

    const trajectories = await Trajectory.find(filter)
      .populate('mazeId', 'name config')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trajectory.countDocuments(filter);

    res.json({
      trajectories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching trajectories:', error);
    res.status(500).json({
      error: 'Failed to fetch trajectories',
      details: error.message
    });
  }
};

/**
 * Get a single trajectory by ID
 * GET /api/trajectories/:id
 */
exports.getTrajectoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      const trajectory = demoStorage.trajectories.find(t => t._id === id);
      if (!trajectory) {
        return res.status(404).json({ error: 'Trajectory not found' });
      }
      return res.json({ trajectory, demoMode: true });
    }

    const trajectory = await Trajectory.findById(id)
      .populate('mazeId');

    if (!trajectory) {
      return res.status(404).json({
        error: 'Trajectory not found'
      });
    }

    res.json({ trajectory });
  } catch (error) {
    console.error('Error fetching trajectory:', error);
    res.status(500).json({
      error: 'Failed to fetch trajectory',
      details: error.message
    });
  }
};

/**
 * Delete a trajectory
 * DELETE /api/trajectories/:id
 */
exports.deleteTrajectory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      const index = demoStorage.trajectories.findIndex(t => t._id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Trajectory not found' });
      }
      demoStorage.trajectories.splice(index, 1);
      return res.json({ message: 'Trajectory deleted (demo mode)', demoMode: true });
    }

    const trajectory = await Trajectory.findByIdAndDelete(id);

    if (!trajectory) {
      return res.status(404).json({
        error: 'Trajectory not found'
      });
    }

    res.json({
      message: 'Trajectory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trajectory:', error);
    res.status(500).json({
      error: 'Failed to delete trajectory',
      details: error.message
    });
  }
};

