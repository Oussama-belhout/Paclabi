/**
 * SimulationBatch Model - Groups simulations for analysis
 */

const mongoose = require('mongoose');

const simulationBatchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    simulations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Simulation'
      }
    ],
    // Statistics (cached for performance)
    stats: {
      totalSimulations: {
        type: Number,
        default: 0
      },
      escapedCount: {
        type: Number,
        default: 0
      },
      caughtCount: {
        type: Number,
        default: 0
      },
      escapeRate: {
        type: Number,
        default: 0
      },
      meanDuration: {
        type: Number,
        default: 0
      },
      minDuration: {
        type: Number,
        default: 0
      },
      maxDuration: {
        type: Number,
        default: 0
      },
      meanFrames: {
        type: Number,
        default: 0
      }
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
simulationBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SimulationBatch', simulationBatchSchema);
