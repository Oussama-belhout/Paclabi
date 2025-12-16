"""
Base Pacman AI - Abstract class for Pacman algorithms
"""

from abc import ABC, abstractmethod


class BasePacmanAI(ABC):
    """Base class for all Pacman AI algorithms"""
    
    def __init__(self, grid):
        """
        Initialize the Pacman AI
        
        Args:
            grid: 2D list representing the maze
        """
        self.grid = grid
        self.height = len(grid)
        self.width = len(grid[0]) if grid else 0
    
    @abstractmethod
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Calculate next move for Pacman
        
        Args:
            pacman_pos: (x, y) tuple of Pacman's current position
            ghost_positions: List of (x, y) tuples for ghost positions
            pellet_positions: List of (x, y) tuples for pellet positions
        
        Returns:
            (x, y) tuple representing next position
        """
        pass
    
    def get_valid_neighbors(self, pos):
        """Get valid neighboring positions (not walls)"""
        x, y = pos
        neighbors = []
        
        # Check all 4 directions
        directions = [(0, -1), (0, 1), (-1, 0), (1, 0)]  # up, down, left, right
        
        for dx, dy in directions:
            new_x, new_y = x + dx, y + dy
            
            # Check boundaries
            if 0 <= new_y < self.height and 0 <= new_x < self.width:
                # Check if not a wall (assuming 1 = wall, 0 = path)
                if self.grid[new_y][new_x] != 1:
                    neighbors.append((new_x, new_y))
        
        return neighbors
    
    def distance(self, pos1, pos2):
        """Calculate Manhattan distance between two positions"""
        return abs(pos1[0] - pos2[0]) + abs(pos1[1] - pos2[1])
