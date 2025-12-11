"""Strategic pellet placement based on maze topology."""

import random
from .base import PelletPlacer


class StrategicPelletPlacer(PelletPlacer):
    """
    Strategically places pellets based on maze structure.
    
    - Places power pellets at dead ends or corners
    - Higher density in corridors
    - Lower density at junctions
    - Creates interesting risk/reward gameplay
    """
    
    def __init__(self, corridor_density=0.8, junction_density=0.4, power_pellet_count=4):
        """
        Initialize strategic pellet placer.
        
        Args:
            corridor_density: Pellet density in corridors
            junction_density: Pellet density at junctions
            power_pellet_count: Number of power pellets
        """
        self.corridor_density = corridor_density
        self.junction_density = junction_density
        self.power_pellet_count = power_pellet_count
    
    def place_pellets(self, grid):
        """Place pellets strategically based on maze topology."""
        # Create a copy to modify
        result = [row[:] for row in grid]
        
        # Get all walkable cells
        walkable = self.get_walkable_cells(grid)
        
        if not walkable:
            return result
        
        # Categorize cells
        dead_ends = []
        corridors = []
        junctions = []
        
        for row, col in walkable:
            neighbor_count = self.count_neighbors(grid, row, col)
            
            if neighbor_count == 1:
                dead_ends.append((row, col))
            elif neighbor_count == 2:
                corridors.append((row, col))
            else:
                junctions.append((row, col))
        
        # Place power pellets at dead ends (preferred) or corners
        power_pellet_locations = []
        
        if len(dead_ends) >= self.power_pellet_count:
            power_pellet_locations = random.sample(dead_ends, self.power_pellet_count)
        else:
            # Use all dead ends and fill remaining with corners
            power_pellet_locations = dead_ends[:]
            corners = self._find_corners(grid, walkable)
            remaining = self.power_pellet_count - len(power_pellet_locations)
            
            if corners and remaining > 0:
                additional = random.sample(corners, min(remaining, len(corners)))
                power_pellet_locations.extend(additional)
        
        # Place power pellets
        for row, col in power_pellet_locations:
            result[row][col] = 3
        
        # Remove power pellet locations from other lists
        power_pellet_set = set(power_pellet_locations)
        dead_ends = [cell for cell in dead_ends if cell not in power_pellet_set]
        corridors = [cell for cell in corridors if cell not in power_pellet_set]
        junctions = [cell for cell in junctions if cell not in power_pellet_set]
        
        # Place normal pellets in corridors
        num_corridor_pellets = int(len(corridors) * self.corridor_density)
        corridor_pellets = random.sample(corridors, min(num_corridor_pellets, len(corridors)))
        
        for row, col in corridor_pellets:
            result[row][col] = 2
        
        # Place fewer pellets at junctions
        num_junction_pellets = int(len(junctions) * self.junction_density)
        junction_pellets = random.sample(junctions, min(num_junction_pellets, len(junctions)))
        
        for row, col in junction_pellets:
            result[row][col] = 2
        
        # Place pellets at dead ends
        for row, col in dead_ends:
            result[row][col] = 2
        
        return result
    
    def _find_corners(self, grid, walkable):
        """Find corner cells (L-shaped connections)."""
        corners = []
        
        for row, col in walkable:
            neighbors = []
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = row + dr, col + dc
                if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == 0:
                    neighbors.append((dr, dc))
            
            # Check if neighbors form an L-shape (perpendicular)
            if len(neighbors) == 2:
                d1, d2 = neighbors
                if (d1[0] * d2[0] + d1[1] * d2[1]) == 0:  # Perpendicular
                    corners.append((row, col))
        
        return corners

