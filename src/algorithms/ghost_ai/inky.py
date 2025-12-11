"""Inky (Cyan Ghost) - The Flanker."""

from .base_agent import GhostAgent


class InkyAgent(GhostAgent):
    """
    Inky - "Bashful" - The Cyan Ghost
    
    Behavior: Complex flanking
    - Targets position calculated from both Pacman and Blinky
    - Draws a vector from Blinky to 2 tiles ahead of Pacman
    - Doubles this vector to get target (flanking maneuver)
    - Most unpredictable behavior
    
    In scatter mode: Targets bottom-right corner
    """
    
    def __init__(self, grid, algorithm='astar'):
        """Initialize Inky agent."""
        super().__init__('inky', grid, algorithm)
        self.rows = len(grid)
        self.cols = len(grid[0]) if grid else 0
        self.scatter_target = (self.rows - 1, self.cols - 1)
    
    def get_target(self, pacman_pos, pacman_dir=None, other_ghosts=None):
        """
        Get Inky's target position.
        
        Chase mode: Complex calculation involving Blinky's position
        Scatter mode: Bottom-right corner
        
        Args:
            pacman_pos: Pacman's current position (row, col)
            pacman_dir: Pacman's direction
            other_ghosts: Dict of other ghost positions {'blinky': (row, col), ...}
        
        Returns:
            tuple: Target position (row, col)
        """
        if self.mode == 'scatter':
            return self.scatter_target
        
        # Need Blinky's position for calculation
        blinky_pos = None
        if other_ghosts and 'blinky' in other_ghosts:
            blinky_pos = other_ghosts['blinky']
        
        # If Blinky position not available, target Pacman directly
        if blinky_pos is None:
            return pacman_pos
        
        # Calculate point 2 tiles ahead of Pacman
        intermediate = self._get_position_ahead(pacman_pos, pacman_dir, 2)
        
        # Calculate vector from Blinky to intermediate point
        vector = (
            intermediate[0] - blinky_pos[0],
            intermediate[1] - blinky_pos[1]
        )
        
        # Double the vector and add to intermediate point
        target_row = intermediate[0] + vector[0]
        target_col = intermediate[1] + vector[1]
        
        # Clamp to grid boundaries
        target_row = max(0, min(target_row, self.rows - 1))
        target_col = max(0, min(target_col, self.cols - 1))
        
        target = (target_row, target_col)
        
        # If target is a wall, find nearest walkable cell
        if not self._is_walkable(target):
            target = self._find_nearest_walkable(target, pacman_pos)
        
        return target
    
    def _get_position_ahead(self, pos, direction, distance):
        """Get position N tiles ahead in given direction."""
        if direction is None:
            return pos
        
        row, col = pos
        
        direction_vectors = {
            'UP': (-1, 0),
            'DOWN': (1, 0),
            'LEFT': (0, -1),
            'RIGHT': (0, 1)
        }
        
        if direction not in direction_vectors:
            return pos
        
        dr, dc = direction_vectors[direction]
        new_row = max(0, min(row + dr * distance, self.rows - 1))
        new_col = max(0, min(col + dc * distance, self.cols - 1))
        
        return (new_row, new_col)
    
    def _is_walkable(self, pos):
        """Check if position is walkable."""
        row, col = pos
        return (0 <= row < self.rows and 
                0 <= col < self.cols and 
                self.grid[row][col] == 0)
    
    def _find_nearest_walkable(self, target, fallback):
        """Find nearest walkable cell to target."""
        for radius in range(1, 10):
            for dr in range(-radius, radius + 1):
                for dc in range(-radius, radius + 1):
                    pos = (target[0] + dr, target[1] + dc)
                    if self._is_walkable(pos):
                        return pos
        return fallback

