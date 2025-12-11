"""Random pellet placement algorithm."""

import random
from .base import PelletPlacer


class RandomPelletPlacer(PelletPlacer):
    """
    Randomly places pellets throughout the maze.
    
    Simple uniform distribution with configurable density.
    """
    
    def __init__(self, density=0.7, power_pellet_count=4):
        """
        Initialize random pellet placer.
        
        Args:
            density: Fraction of walkable cells with pellets (0.0-1.0)
            power_pellet_count: Number of power pellets to place
        """
        self.density = max(0.0, min(1.0, density))
        self.power_pellet_count = power_pellet_count
    
    def place_pellets(self, grid):
        """Place pellets randomly on walkable cells."""
        # Create a copy to modify
        result = [row[:] for row in grid]
        
        # Get all walkable cells
        walkable = self.get_walkable_cells(grid)
        
        if not walkable:
            return result
        
        # Calculate number of normal pellets
        num_pellets = int(len(walkable) * self.density)
        num_pellets = min(num_pellets, len(walkable) - self.power_pellet_count)
        
        # Randomly select cells for pellets
        pellet_cells = random.sample(walkable, num_pellets + self.power_pellet_count)
        
        # Place power pellets first
        for i in range(self.power_pellet_count):
            if i < len(pellet_cells):
                row, col = pellet_cells[i]
                result[row][col] = 3  # Power pellet
        
        # Place normal pellets
        for i in range(self.power_pellet_count, len(pellet_cells)):
            row, col = pellet_cells[i]
            result[row][col] = 2  # Normal pellet
        
        return result

