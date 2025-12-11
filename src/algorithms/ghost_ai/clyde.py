"""Clyde (Orange Ghost) - The Random/Scared."""

from .base_agent import GhostAgent


class ClydeAgent(GhostAgent):
    """
    Clyde - "Pokey" - The Orange Ghost
    
    Behavior: Scared/Random
    - Chases Pacman when far away (>8 tiles)
    - Runs to scatter target when close (<= 8 tiles)
    - Creates unpredictable behavior near Pacman
    - Least aggressive ghost
    
    In scatter mode: Targets bottom-left corner
    """
    
    def __init__(self, grid, algorithm='astar', retreat_distance=8):
        """
        Initialize Clyde agent.
        
        Args:
            grid: Maze grid
            algorithm: Pathfinding algorithm
            retreat_distance: Distance threshold to switch from chase to retreat
        """
        super().__init__('clyde', grid, algorithm)
        self.retreat_distance = retreat_distance
        self.rows = len(grid)
        self.cols = len(grid[0]) if grid else 0
        self.scatter_target = (self.rows - 1, 0)
    
    def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
        """
        Get Clyde's target position.
        
        Chase mode: 
        - If far from Pacman (>8 tiles): Target Pacman directly
        - If close to Pacman (<=8 tiles): Retreat to scatter corner
        
        Scatter mode: Bottom-left corner
        
        Args:
            pacman_pos: Pacman's current position (row, col)
            pacman_dir: Not used by Clyde
            other_ghosts: Not used by Clyde
        
        Returns:
            tuple: Target position (row, col)
        """
        if self.mode == 'scatter':
            return self.scatter_target
        
        # Calculate distance to Pacman
        distance = self.distance_to(pacman_pos)
        
        # If far away, chase Pacman
        if distance > self.retreat_distance:
            return pacman_pos
        else:
            # If close, retreat to scatter corner
            return self.scatter_target

