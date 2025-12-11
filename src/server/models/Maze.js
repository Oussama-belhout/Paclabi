/**
 * Maze model for MongoDB
 */

const mongoose = require('mongoose');

const mazeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  config: {
    width: {
      type: Number,
      required: true,
      min: 3,
      max: 50
    },
    height: {
      type: Number,
      required: true,
      min: 3,
      max: 50
    },
    algorithm: {
      type: String,
      required: true,
      enum: ['kruskal', 'prim', 'recursive_backtracker', 'wilson']
    },
    imperfection: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    hasPellets: {
      type: Boolean,
      default: false
    },
    pelletAlgorithm: {
      type: String,
      enum: ['random', 'strategic', 'classic', null],
      default: null
    },
    tunnels: {
      horizontal: {
        type: Number,
        default: 1
      },
      vertical: {
        type: Number,
        default: 0
      }
    }
  },
  grid: {
    type: [[Number]],
    required: true
  },
  rating: {
    user: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    core: {
      type: Number,
      default: null
    },
    metrics: {
      complexity: Number,
      connectivity: Number,
      balance: Number
    }
  },
  thumbnail: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
mazeSchema.index({ 'rating.user': -1 });
mazeSchema.index({ createdAt: -1 });
mazeSchema.index({ name: 1 });

module.exports = mongoose.model('Maze', mazeSchema);

