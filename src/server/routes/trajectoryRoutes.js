/**
 * Trajectory Routes
 */

const express = require('express');
const router = express.Router();
const trajectoryController = require('../controllers/trajectoryController');

// Save new trajectory
router.post('/', trajectoryController.saveTrajectory);

// Get all trajectories
router.get('/', trajectoryController.getAllTrajectories);

// Get single trajectory
router.get('/:id', trajectoryController.getTrajectoryById);

// Delete trajectory
router.delete('/:id', trajectoryController.deleteTrajectory);

module.exports = router;

