/**
 * Formatting utilities
 */

const Formatters = {
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  },

  formatAlgorithmName(algorithm) {
    const names = {
      'kruskal': "Kruskal's Algorithm",
      'prim': "Prim's Algorithm",
      'recursive_backtracker': 'Recursive Backtracker',
      'wilson': "Wilson's Algorithm",
      'random': 'Random Placement',
      'strategic': 'Strategic Placement',
      'classic': 'Classic Pac-Man',
      'astar': 'A* Pathfinding',
      'bfs': 'Breadth-First Search'
    };

    return names[algorithm] || algorithm;
  },

  formatGhostType(type) {
    const names = {
      'blinky': 'Blinky (Red) - Chaser',
      'pinky': 'Pinky (Pink) - Ambusher',
      'inky': 'Inky (Cyan) - Flanker',
      'clyde': 'Clyde (Orange) - Random'
    };

    return names[type] || type;
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }
};

