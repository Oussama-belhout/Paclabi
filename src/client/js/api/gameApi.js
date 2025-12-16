/**
 * Game API Client (Trajectories & Simulations)
 */

const GameAPI = {
  trajectoryBaseURL: '/api/trajectories',
  simulationBaseURL: '/api/simulations',
  batchBaseURL: '/api/batches',

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
  },

  // Batch methods
  async createBatch(name, description = '') {
    const response = await fetch(this.batchBaseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create batch');
    }

    return await response.json();
  },

  async getAllBatches(page = 1, limit = 20) {
    const response = await fetch(`${this.batchBaseURL}?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch batches');
    }

    return await response.json();
  },

  async getBatchById(id) {
    const response = await fetch(`${this.batchBaseURL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch batch');
    }

    return await response.json();
  },

  async updateBatch(id, name, description) {
    const response = await fetch(`${this.batchBaseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
      throw new Error('Failed to update batch');
    }

    return await response.json();
  },

  async addSimulationsToBatch(batchId, simulationIds) {
    const response = await fetch(`${this.batchBaseURL}/${batchId}/add-simulations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulationIds })
    });

    if (!response.ok) {
      throw new Error('Failed to add simulations to batch');
    }

    return await response.json();
  },

  async removeSimulationFromBatch(batchId, simulationId) {
    const response = await fetch(`${this.batchBaseURL}/${batchId}/simulations/${simulationId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to remove simulation from batch');
    }

    return await response.json();
  },

  async clearBatch(batchId) {
    const response = await fetch(`${this.batchBaseURL}/${batchId}/clear`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to clear batch');
    }

    return await response.json();
  },

  async deleteBatch(id) {
    const response = await fetch(`${this.batchBaseURL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete batch');
    }

    return await response.json();
  }
};

