/**
 * Maze API Client
 */

const MazeAPI = {
  baseURL: '/api/mazes',

  async generateMaze(config) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate maze');
    }

    return await response.json();
  },

  async getAllMazes(page = 1, limit = 20) {
    const response = await fetch(`${this.baseURL}?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch mazes');
    }

    return await response.json();
  },

  async getMazeById(id) {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch maze');
    }

    return await response.json();
  },

  async updateRating(id, userRating) {
    const response = await fetch(`${this.baseURL}/${id}/rating`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userRating })
    });

    if (!response.ok) {
      throw new Error('Failed to update rating');
    }

    return await response.json();
  },

  async deleteMaze(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete maze');
    }

    return await response.json();
  }
};

