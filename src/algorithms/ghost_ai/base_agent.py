"""Base class for ghost AI agents."""

from abc import ABC, abstractmethod
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathfinding.astar import AStar
from utils.distance import manhattan_distance


class GhostAgent(ABC):
    """
    Abstract base class for ghost AI agents.
    Implements the Strategy pattern for different ghost behaviors.
    """
    
    def __init__(self, ghost_id, grid, algorithm='astar'):
        """
        Initialize ghost agent.
        
        Args:
            ghost_id: Unique identifier for this ghost
            grid: 2D maze grid (0=walkable)
            algorithm: Pathfinding algorithm to use ('astar' or 'bfs')
        """
        self.ghost_id = ghost_id
        self.grid = grid
        self.algorithm = algorithm
        
        # Initialize pathfinder
        if algorithm == 'astar':
            self.pathfinder = AStar(grid)
        else:
            from ..pathfinding.bfs import BFS
            self.pathfinder = BFS(grid)
        
        # State
        self.position = None
        self.mode = 'chase'  # 'chase', 'scatter', 'frightened'
    
    @abstractmethod
    def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
        """
        Calculate the target position for this ghost.
        
        Args:
            pacman_pos: Current Pacman position (row, col)
            pacman_dir: Current Pacman direction (for Pinky, Inky)
            other_ghosts: Positions of other ghosts (for Inky)
        
        Returns:
            tuple: Target position (row, col)
        """
        pass
    
    def get_next_move(self, pacman_pos, pacman_dir=None, other_ghosts=None):
        """
        Determine the next move for this ghost.
        
        Args:
            pacman_pos: Current Pacman position
            pacman_dir: Current Pacman direction
            other_ghosts: Positions of other ghosts
        
        Returns:
            tuple: Next position (row, col) or None
        """
        if self.position is None:
            return None
        
        # Get target based on ghost behavior
        target = self.get_target(pacman_pos, pacman_dir, other_ghosts)
        
        if target is None:
            return None
        
        # Use pathfinding to determine next move
        next_pos = self.pathfinder.find_next_move(self.position, target)
        
        return next_pos
    
    def set_position(self, position):
        """Set ghost's current position. If position is in a wall, find nearest valid position."""
        if isinstance(position, dict):
            position = (position['y'], position['x'])
        
        # Check if position is valid (walkable)
        if self._is_position_valid(position):
            self.position = position
        else:
            # Position is in a wall, find nearest walkable cell
            nearest = self._find_nearest_walkable(position)
            if nearest:
                self.position = nearest
            else:
                # If no walkable cell found (shouldn't happen in a valid maze), use as-is
                self.position = position
    
    def _is_position_valid(self, pos):
        """Check if position is walkable."""
        row, col = pos
        if 0 <= row < len(self.grid) and 0 <= col < len(self.grid[0]):
            return self.grid[row][col] == 0
        return False
    
    def _find_nearest_walkable(self, pos):
        """Find nearest walkable cell using BFS."""
        from collections import deque
        
        row, col = pos
        visited = set()
        queue = deque([(row, col, 0)])  # (row, col, distance)
        visited.add((row, col))
        
        while queue:
            r, c, dist = queue.popleft()
            
            # Check if this position is walkable
            if self._is_position_valid((r, c)):
                return (r, c)
            
            # Explore neighbors
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = r + dr, c + dc
                if (nr, nc) not in visited and 0 <= nr < len(self.grid) and 0 <= nc < len(self.grid[0]):
                    visited.add((nr, nc))
                    queue.append((nr, nc, dist + 1))
        
        return None
    
    def set_mode(self, mode):
        """Set ghost's behavior mode."""
        self.mode = mode
    
    def distance_to(self, target):
        """Calculate Manhattan distance to target."""
        if self.position is None or target is None:
            return float('inf')
        return manhattan_distance(self.position, target)

