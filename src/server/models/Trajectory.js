/**
 * Trajectory model for recorded Pacman gameplay
 */

const mongoose = require('mongoose');

const trajectorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mazeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maze',
    required: true
  },
  moves: [{
    position: {
      x: {
        type: Number,
        required: true
      },
      y: {
        type: Number,
        required: true
      }
    },
    direction: {
      type: String,
      enum: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
      required: true
    },
    timestamp: {
      type: Number,
      required: true
    },
    pelletsEaten: {
      type: Number,
      default: 0
    }
  }],
  duration: {
    type: Number,
    required: true
  },
  pelletsCollected: {
    type: Number,
    default: 0
  },
  totalPellets: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
trajectorySchema.index({ mazeId: 1, createdAt: -1 });
trajectorySchema.index({ name: 1 });

module.exports = mongoose.model('Trajectory', trajectorySchema);

