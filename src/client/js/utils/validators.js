/**
 * Validation utilities
 */

const Validators = {
  validateMazeConfig(config) {
    const errors = [];

    if (!config.name || config.name.trim() === '') {
      errors.push('Maze name is required');
    }

    if (!config.width || config.width < 3 || config.width > 50) {
      errors.push('Width must be between 3 and 50');
    }

    if (!config.height || config.height < 3 || config.height > 50) {
      errors.push('Height must be between 3 and 50');
    }

    if (config.imperfection < 0 || config.imperfection > 100) {
      errors.push('Imperfection must be between 0 and 100');
    }

    return errors;
  },

  validateTrajectory(data) {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('Trajectory name is required');
    }

    if (!data.mazeId) {
      errors.push('Maze ID is required');
    }

    if (!data.moves || !Array.isArray(data.moves) || data.moves.length === 0) {
      errors.push('Trajectory must have at least one move');
    }

    if (!data.duration || data.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }

    return errors;
  },

  validateSimulationConfig(config) {
    const errors = [];

    if (!config.name || config.name.trim() === '') {
      errors.push('Simulation name is required');
    }

    if (!config.trajectoryId) {
      errors.push('Trajectory ID is required');
    }

    if (!config.ghostConfigs || !Array.isArray(config.ghostConfigs) || config.ghostConfigs.length === 0) {
      errors.push('At least one ghost configuration is required');
    }

    return errors;
  }
};

