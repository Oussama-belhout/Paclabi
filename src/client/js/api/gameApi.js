/**
 * Game API Client (Trajectories & Simulations)
 */

const GameAPI = {
  trajectoryBaseURL: '/api/trajectories',
  simulationBaseURL: '/api/simulations',

  // Trajectory methods
  async saveTrajectory(data) {
    const response = await fetch(this.trajectoryBaseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save trajectory');
    }

    return await response.json();
  },

  async getAllTrajectories(page = 1, limit = 20, mazeId = null) {
    let url = `${this.trajectoryBaseURL}?page=${page}&limit=${limit}`;
    if (mazeId) {
      url += `&mazeId=${mazeId}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch trajectories');
    }

    return await response.json();
  },

  async getTrajectoryById(id) {
    const response = await fetch(`${this.trajectoryBaseURL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch trajectory');
    }

    return await response.json();
  },

  async deleteTrajectory(id) {
    const response = await fetch(`${this.trajectoryBaseURL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete trajectory');
    }

    return await response.json();
  },

  // Simulation methods
  async saveSimulation(data) {
    const response = await fetch(this.simulationBaseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save simulation');
    }

    return await response.json();
  },

  async getAllSimulations(page = 1, limit = 20) {
    const response = await fetch(`${this.simulationBaseURL}?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch simulations');
    }

    return await response.json();
  },

  async getSimulationById(id, includeFrames = false) {
    const response = await fetch(`${this.simulationBaseURL}/${id}?includeFrames=${includeFrames}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch simulation');
    }

    return await response.json();
  },

  async getReplayFrames(id) {
    const response = await fetch(`${this.simulationBaseURL}/${id}/replay`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch replay frames');
    }

    return await response.json();
  },

  async deleteSimulation(id) {
    const response = await fetch(`${this.simulationBaseURL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete simulation');
    }

    return await response.json();
  }
};

