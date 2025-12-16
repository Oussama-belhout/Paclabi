/**
 * Simulation Batch Controller
 * Handles batch creation, management, and statistics
 */

const SimulationBatch = require('../models/SimulationBatch');
const Simulation = require('../models/Simulation');
const mongoose = require('mongoose');

/**
 * Create a new simulation batch
 * POST /api/batches
 */
exports.createBatch = async (req, res) => {
  try {
    const { name, description = '' } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Batch name is required' });
    }

    const batch = new SimulationBatch({
      name: name.trim(),
      description: description.trim(),
      simulations: []
    });

    await batch.save();

    res.status(201).json({
      message: 'Batch created successfully',
      batch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
};

/**
 * Get all batches
 * GET /api/batches
 */
exports.getAllBatches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const batches = await SimulationBatch.find()
      .select('-simulations') // Don't include full simulation array in list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SimulationBatch.countDocuments();

    res.json({
      batches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

/**
 * Get batch by ID with simulations
 * GET /api/batches/:id
 */
exports.getBatchById = async (req, res) => {
  try {
    const batch = await SimulationBatch.findById(req.params.id).populate({
      path: 'simulations',
      select: 'name results mazeId trajectoryId ghostConfigs createdAt'
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({ batch });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
};

/**
 * Add simulation(s) to batch
 * POST /api/batches/:id/add-simulations
 */
exports.addSimulationsToBatch = async (req, res) => {
  try {
    const { simulationIds } = req.body;

    if (!Array.isArray(simulationIds) || simulationIds.length === 0) {
      return res.status(400).json({ error: 'Simulation IDs array is required' });
    }

    const batch = await SimulationBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Convert to ObjectIds and filter duplicates
    const newIds = simulationIds.map(id => new mongoose.Types.ObjectId(id));
    const existingIds = batch.simulations.map(id => id.toString());

    for (const id of newIds) {
      if (!existingIds.includes(id.toString())) {
        batch.simulations.push(id);
      }
    }

    batch.updatedAt = new Date();
    await batch.save();

    // Recalculate statistics
    await exports.recalculateBatchStats(batch._id);

    const updatedBatch = await SimulationBatch.findById(batch._id);
    res.json({
      message: 'Simulations added to batch',
      batch: updatedBatch
    });
  } catch (error) {
    console.error('Error adding simulations to batch:', error);
    res.status(500).json({ error: 'Failed to add simulations to batch' });
  }
};

/**
 * Remove simulation from batch
 * DELETE /api/batches/:id/simulations/:simulationId
 */
exports.removeSimulationFromBatch = async (req, res) => {
  try {
    const { id, simulationId } = req.params;

    const batch = await SimulationBatch.findById(id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    batch.simulations = batch.simulations.filter(
      simId => simId.toString() !== simulationId
    );

    batch.updatedAt = new Date();
    await batch.save();

    // Recalculate statistics
    await exports.recalculateBatchStats(batch._id);

    const updatedBatch = await SimulationBatch.findById(batch._id);
    res.json({
      message: 'Simulation removed from batch',
      batch: updatedBatch
    });
  } catch (error) {
    console.error('Error removing simulation from batch:', error);
    res.status(500).json({ error: 'Failed to remove simulation from batch' });
  }
};

/**
 * Recalculate batch statistics
 */
exports.recalculateBatchStats = async (batchId) => {
  try {
    const batch = await SimulationBatch.findById(batchId).populate('simulations');

    if (!batch) return;

    const sims = batch.simulations;

    if (sims.length === 0) {
      batch.stats = {
        totalSimulations: 0,
        escapedCount: 0,
        caughtCount: 0,
        escapeRate: 0,
        meanDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        meanFrames: 0
      };
      await batch.save();
      return;
    }

    const escapedCount = sims.filter(sim => !sim.results.caught).length;
    const caughtCount = sims.filter(sim => sim.results.caught).length;

    const durations = sims.map(sim => sim.results.duration || 0);
    const frames = sims.map(sim => sim.results.totalFrames || 0);

    const meanDuration = durations.reduce((a, b) => a + b, 0) / sims.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const meanFrames = frames.reduce((a, b) => a + b, 0) / sims.length;

    batch.stats = {
      totalSimulations: sims.length,
      escapedCount,
      caughtCount,
      escapeRate: (escapedCount / sims.length) * 100,
      meanDuration: Math.round(meanDuration),
      minDuration,
      maxDuration,
      meanFrames: Math.round(meanFrames)
    };

    batch.updatedAt = new Date();
    await batch.save();
  } catch (error) {
    console.error('Error recalculating batch stats:', error);
  }
};

/**
 * Update batch
 * PUT /api/batches/:id
 */
exports.updateBatch = async (req, res) => {
  try {
    const { name, description } = req.body;

    const batch = await SimulationBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    if (name) batch.name = name.trim();
    if (description !== undefined) batch.description = description.trim();

    batch.updatedAt = new Date();
    await batch.save();

    res.json({
      message: 'Batch updated successfully',
      batch
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({ error: 'Failed to update batch' });
  }
};

/**
 * Delete batch
 * DELETE /api/batches/:id
 */
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await SimulationBatch.findByIdAndDelete(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({
      message: 'Batch deleted successfully',
      batch
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ error: 'Failed to delete batch' });
  }
};

/**
 * Clear all simulations from batch
 * POST /api/batches/:id/clear
 */
exports.clearBatch = async (req, res) => {
  try {
    const batch = await SimulationBatch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    batch.simulations = [];
    batch.updatedAt = new Date();
    await batch.save();

    // Recalculate statistics
    await exports.recalculateBatchStats(batch._id);

    const updatedBatch = await SimulationBatch.findById(batch._id);
    res.json({
      message: 'Batch cleared successfully',
      batch: updatedBatch
    });
  } catch (error) {
    console.error('Error clearing batch:', error);
    res.status(500).json({ error: 'Failed to clear batch' });
  }
};
