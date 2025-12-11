/**
 * Simulation Routes
 */

const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

// Run new simulation
router.post('/', simulationController.runSimulation);

// Get all simulations
router.get('/', simulationController.getAllSimulations);

// Get single simulation
router.get('/:id', simulationController.getSimulationById);

// Get replay frames
router.get('/:id/replay', simulationController.getReplayFrames);

// Delete simulation
router.delete('/:id', simulationController.deleteSimulation);

module.exports = router;

