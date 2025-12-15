/**
 * Simulation Controller
 * Handles ghost AI simulation of recorded trajectories
 */

const Simulation = require('../models/Simulation');
const Trajectory = require('../models/Trajectory');
const Maze = require('../models/Maze');
const pythonBridge = require('../services/pythonBridge');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');

// In-memory storage for demo mode
const demoStorage = {
  simulations: [],
  nextId: 1
};

// Demo mode helpers to access maze and trajectory storage from other controllers
const mazeController = require('./mazeController');
const trajectoryController = require('./trajectoryController');

/**
 * Run a new simulation
 * POST /api/simulations
 */
exports.runSimulation = async (req, res) => {
  try {
    const {
      name,
      trajectoryId,
      ghostConfigs
    } = req.body;

    // Validate required fields
    if (!name || !trajectoryId || !ghostConfigs || !Array.isArray(ghostConfigs)) {
      return res.status(400).json({
        error: 'Missing required fields: name, trajectoryId, ghostConfigs (array)'
      });
    }

    // Get simulation results from request body (from frontend)
    const simulationResults = req.body.results;
    
    // Check if MongoDB is connected
    let trajectory, maze;
    
    if (mongoose.connection.readyState !== 1) {
      // Demo mode - save to memory
      console.log('Demo mode: Saving simulation to memory');
      
      const simulation = {
        _id: `demo-sim-${demoStorage.nextId++}`,
        name,
        trajectoryId,
        mazeId: req.body.mazeId || null,
        ghostConfigs: ghostConfigs.map(config => ({
          ghostType: config.type || config.ghostType || 'blinky',
          algorithm: config.algorithm || 'astar',
          startPosition: config.startPos || config.startPosition || { x: 1, y: 1 }
        })),
        results: simulationResults || {
          caught: false,
          catchPosition: null,
          catchTime: null,
          duration: 0,
          totalFrames: 0,
          frames: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      demoStorage.simulations.push(simulation);
      
      console.log('Simulation saved to demo storage:', simulation._id);
      
      return res.status(201).json({
        message: 'Simulation saved successfully (DEMO MODE)',
        simulation,
        demoMode: true
      });
    }
    
    // Fetch trajectory
    trajectory = await Trajectory.findById(trajectoryId).populate('mazeId');
    
    if (!trajectory) {
      return res.status(404).json({
        error: 'Trajectory not found'
      });
    }

    maze = trajectory.mazeId;
    if (!maze) {
      return res.status(404).json({
        error: 'Associated maze not found'
      });
    }

    // If simulation results are already provided (from frontend simulation)
    if (simulationResults) {
      // Transform ghost configs to match schema
      const transformedGhostConfigs = ghostConfigs.map(config => ({
        ghostType: config.type || config.ghostType,
        algorithm: config.algorithm || 'astar',
        startPosition: config.startPos || config.startPosition
      }));
      
      const simulation = new Simulation({
        name,
        trajectoryId,
        mazeId: maze._id,
        ghostConfigs: transformedGhostConfigs,
        results: simulationResults
      });

      await simulation.save();

      return res.status(201).json({
        message: 'Simulation saved successfully',
        simulation
      });
    }

    // Otherwise, run Python simulation
    // Create temporary files for Python simulation
    const tempDir = os.tmpdir();
    const trajectoryFile = path.join(tempDir, `trajectory-${Date.now()}.json`);
    const gridFile = path.join(tempDir, `grid-${Date.now()}.json`);

    try {
      // Write trajectory and grid to temp files
      await fs.writeFile(trajectoryFile, JSON.stringify({
        moves: trajectory.moves
      }));
      
      await fs.writeFile(gridFile, JSON.stringify({
        grid: maze.grid
      }));

      // Run simulation via Python
      const simulationResult = await pythonBridge.simulateGame(
        trajectoryFile,
        gridFile,
        ghostConfigs
      );

      // Save simulation to database
      const simulation = new Simulation({
        name,
        trajectoryId,
        mazeId: maze._id,
        ghostConfigs,
        results: simulationResult
      });

      await simulation.save();

      // Clean up temp files
      await fs.unlink(trajectoryFile).catch(() => {});
      await fs.unlink(gridFile).catch(() => {});

      res.status(201).json({
        message: 'Simulation completed successfully',
        simulation
      });
    } catch (error) {
      // Clean up temp files on error
      await fs.unlink(trajectoryFile).catch(() => {});
      await fs.unlink(gridFile).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('Error running simulation:', error);
    res.status(500).json({
      error: 'Failed to run simulation',
      details: error.message
    });
  }
};

/**
 * Get all simulations
 * GET /api/simulations
 */
exports.getAllSimulations = async (req, res) => {
  try {
    const { page = 1, limit = 20, trajectoryId, mazeId } = req.query;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      return res.json({
        simulations: demoStorage.simulations.slice(0, parseInt(limit)),
        pagination: {
          total: demoStorage.simulations.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(demoStorage.simulations.length / limit)
        },
        demoMode: true
      });
    }

    const filter = {};
    if (trajectoryId) filter.trajectoryId = trajectoryId;
    if (mazeId) filter.mazeId = mazeId;

    const skip = (page - 1) * limit;

    const simulations = await Simulation.find(filter)
      .populate('trajectoryId', 'name duration')
      .populate('mazeId', 'name config')
      .select('-results.frames') // Exclude heavy frame data in list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Simulation.countDocuments(filter);

    res.json({
      simulations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching simulations:', error);
    res.status(500).json({
      error: 'Failed to fetch simulations',
      details: error.message
    });
  }
};

/**
 * Get a single simulation by ID
 * GET /api/simulations/:id
 */
exports.getSimulationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeFrames = 'false' } = req.query;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Demo mode
      const simulation = demoStorage.simulations.find(s => s._id === id);
      if (!simulation) {
        return res.status(404).json({ error: 'Simulation not found' });
      }
      return res.json({ simulation, demoMode: true });
    }

    let query = Simulation.findById(id)
      .populate('trajectoryId')
      .populate('mazeId');

    // Optionally exclude heavy frame data
    if (includeFrames === 'false') {
      query = query.select('-results.frames');
    }

    const simulation = await query;

    if (!simulation) {
      return res.status(404).json({
        error: 'Simulation not found'
      });
    }

    res.json({ simulation });
  } catch (error) {
    console.error('Error fetching simulation:', error);
    res.status(500).json({
      error: 'Failed to fetch simulation',
      details: error.message
    });
  }
};

/**
 * Get simulation replay frames
 * GET /api/simulations/:id/replay
 */
exports.getReplayFrames = async (req, res) => {
  try {
    const { id } = req.params;

    const simulation = await Simulation.findById(id)
      .select('results.frames');

    if (!simulation) {
      return res.status(404).json({
        error: 'Simulation not found'
      });
    }

    res.json({
      frames: simulation.results.frames
    });
  } catch (error) {
    console.error('Error fetching replay frames:', error);
    res.status(500).json({
      error: 'Failed to fetch replay frames',
      details: error.message
    });
  }
};

/**
 * Delete a simulation
 * DELETE /api/simulations/:id
 */
exports.deleteSimulation = async (req, res) => {
  try {
    const { id } = req.params;

    const simulation = await Simulation.findByIdAndDelete(id);

    if (!simulation) {
      return res.status(404).json({
        error: 'Simulation not found'
      });
    }

    res.json({
      message: 'Simulation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting simulation:', error);
    res.status(500).json({
      error: 'Failed to delete simulation',
      details: error.message
    });
  }
};

