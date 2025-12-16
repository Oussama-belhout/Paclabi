/**
 * Simulation Batch Routes
 */

const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// Batch operations
router.post('/', batchController.createBatch);
router.get('/', batchController.getAllBatches);
router.get('/:id', batchController.getBatchById);
router.put('/:id', batchController.updateBatch);
router.delete('/:id', batchController.deleteBatch);

// Batch simulation management
router.post('/:id/add-simulations', batchController.addSimulationsToBatch);
router.delete('/:id/simulations/:simulationId', batchController.removeSimulationFromBatch);
router.post('/:id/clear', batchController.clearBatch);

module.exports = router;
