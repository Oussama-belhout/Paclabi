/**
 * Maze Routes
 */

const express = require('express');
const router = express.Router();
const mazeController = require('../controllers/mazeController');

// Generate new maze
router.post('/', mazeController.generateMaze);

// Get all mazes
router.get('/', mazeController.getAllMazes);

// Get single maze
router.get('/:id', mazeController.getMazeById);

// Update maze rating
router.put('/:id/rating', mazeController.updateRating);

// Delete maze
router.delete('/:id', mazeController.deleteMaze);

module.exports = router;

