"""Blinky (Red Ghost) - The Chaser."""

from .base_agent import GhostAgent


class BlinkyAgent(GhostAgent):
    """
    Blinky - "Shadow" - The Red Ghost
    
    Behavior: Direct chase
    - Targets Pacman's exact current position
    - Most aggressive and straightforward
    - Uses A* with Manhattan distance for optimal pursuit
    
    In scatter mode: Targets top-right corner
    """
    
    def __init__(self, grid, algorithm='astar'):
        """Initialize Blinky agent."""
        super().__init__('blinky', grid, algorithm)
        self.scatter_target = (0, len(grid[0]) - 1) if grid and grid[0] else (0, 0)
    
    def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
        """
        Get Blinky's target position.
        
        Chase mode: Pacman's exact position
        Scatter mode: Top-right corner
        
        Args:
            pacman_pos: Pacman's current position (row, col)
            pacman_dir: Not used by Blinky
            other_ghosts: Not used by Blinky
        
        Returns:
            tuple: Target position (row, col)
        """
        if self.mode == 'scatter':
            return self.scatter_target
        
        # Chase mode: target Pacman directly
        return pacman_pos

