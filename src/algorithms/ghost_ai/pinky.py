"""Pinky (Pink Ghost) - The Ambusher."""

from .base_agent import GhostAgent


class PinkyAgent(GhostAgent):
    """
    Pinky - "Speedy" - The Pink Ghost
    
    Behavior: Ambush ahead
    - Targets 4 tiles ahead of Pacman's current direction
    - Tries to cut off Pacman's path
    - Uses predictive positioning
    
    In scatter mode: Targets top-left corner
    """
    
    def __init__(self, grid, algorithm='astar', prediction_distance=4):
        """
        Initialize Pinky agent.
        
        Args:
            grid: Maze grid
            algorithm: Pathfinding algorithm
            prediction_distance: How many tiles ahead to target
        """
        super().__init__('pinky', grid, algorithm)
        self.prediction_distance = prediction_distance
        self.scatter_target = (0, 0)
        
        self.rows = len(grid)
        self.cols = len(grid[0]) if grid else 0
    
    def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
        """
        Get Pinky's target position.
        
        Chase mode: 4 tiles ahead of Pacman in his current direction
        Scatter mode: Top-left corner
        
        Args:
            pacman_pos: Pacman's current position (row, col)
            pacman_dir: Pacman's direction ('UP', 'DOWN', 'LEFT', 'RIGHT')
            other_ghosts: Not used by Pinky
        
        Returns:
            tuple: Target position (row, col)
        """
        if self.mode == 'scatter':
            return self.scatter_target
        
        # If no direction provided, target Pacman directly
        if pacman_dir is None:
            return pacman_pos
        
        # Calculate position ahead of Pacman
        row, col = pacman_pos
        
        direction_vectors = {
            'UP': (-1, 0),
            'DOWN': (1, 0),
            'LEFT': (0, -1),
            'RIGHT': (0, 1)
        }
        
        if pacman_dir not in direction_vectors:
            return pacman_pos
        
        dr, dc = direction_vectors[pacman_dir]
        target_row = row + (dr * self.prediction_distance)
        target_col = col + (dc * self.prediction_distance)
        
        # Clamp to grid boundaries
        target_row = max(0, min(target_row, self.rows - 1))
        target_col = max(0, min(target_col, self.cols - 1))
        
        # If target is a wall, find nearest walkable cell
        target = (target_row, target_col)
        if not self._is_walkable(target):
            target = self._find_nearest_walkable(target, pacman_pos)
        
        return target
    
    def _is_walkable(self, pos):
        """Check if position is walkable."""
        row, col = pos
        return (0 <= row < self.rows and 
                0 <= col < self.cols and 
                self.grid[row][col] == 0)
    
    def _find_nearest_walkable(self, target, fallback):
        """Find nearest walkable cell to target, or return fallback."""
        # Search in expanding radius
        for radius in range(1, 10):
            for dr in range(-radius, radius + 1):
                for dc in range(-radius, radius + 1):
                    pos = (target[0] + dr, target[1] + dc)
                    if self._is_walkable(pos):
                        return pos
        
        return fallback

