/**
 * Simulation model for ghost AI replays
 */

const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  trajectoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trajectory',
    required: true
  },
  mazeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maze',
    required: true
  },
  ghostConfigs: [{
    ghostType: {
      type: String,
      enum: ['blinky', 'pinky', 'inky', 'clyde'],
      required: true
    },
    algorithm: {
      type: String,
      enum: ['astar', 'bfs'],
      default: 'astar'
    },
    startPosition: {
      x: Number,
      y: Number
    }
  }],
  results: {
    caught: {
      type: Boolean,
      default: false
    },
    catchPosition: {
      x: Number,
      y: Number
    },
    catchTime: Number,
    totalFrames: Number,
    frames: [{
      timestamp: Number,
      pacman: {
        x: Number,
        y: Number
      },
      ghosts: [{
        type: String,
        position: {
          x: Number,
          y: Number
        }
      }],
      caught: Boolean
    }]
  }
}, {
  timestamps: true
});

// Indexes
simulationSchema.index({ trajectoryId: 1, createdAt: -1 });
simulationSchema.index({ mazeId: 1 });

module.exports = mongoose.model('Simulation', simulationSchema);

