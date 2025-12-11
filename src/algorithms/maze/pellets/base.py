"""Base class for pellet placement strategies."""

from abc import ABC, abstractmethod


class PelletPlacer(ABC):
    """
    Abstract base class for pellet placement algorithms.
    Implements the Strategy pattern for interchangeable placement strategies.
    
    Cell types:
    - 0: Empty path
    - 1: Wall
    - 2: Normal pellet
    - 3: Power pellet
    """
    
    @abstractmethod
    def place_pellets(self, grid):
        """
        Place pellets on a maze grid.
        
        Args:
            grid: 2D array where 0=path, 1=wall
        
        Returns:
            list: Modified grid with pellets (2) and power pellets (3)
        """
        pass
    
    def get_walkable_cells(self, grid):
        """Get all walkable (path) cells from grid."""
        walkable = []
        for row in range(len(grid)):
            for col in range(len(grid[0])):
                if grid[row][col] == 0:
                    walkable.append((row, col))
        return walkable
    
    def count_neighbors(self, grid, row, col):
        """Count walkable neighbors of a cell."""
        count = 0
        rows, cols = len(grid), len(grid[0])
        
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = row + dr, col + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                count += 1
        
        return count
    
    def is_dead_end(self, grid, row, col):
        """Check if a cell is a dead end (only 1 neighbor)."""
        return self.count_neighbors(grid, row, col) == 1
    
    def is_junction(self, grid, row, col):
        """Check if a cell is a junction (3+ neighbors)."""
        return self.count_neighbors(grid, row, col) >= 3

