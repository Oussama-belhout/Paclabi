"""Classic Pac-Man style pellet placement."""

from .base import PelletPlacer


class ClassicPelletPlacer(PelletPlacer):
    """
    Places pellets in classic Pac-Man style.
    
    - Pellets on every walkable cell except near power pellets
    - Power pellets in corners or strategic locations
    - Creates the authentic Pac-Man feel
    """
    
    def __init__(self, power_pellet_count=4, power_pellet_clearance=2):
        """
        Initialize classic pellet placer.
        
        Args:
            power_pellet_count: Number of power pellets (typically 4)
            power_pellet_clearance: Cells around power pellets without normal pellets
        """
        self.power_pellet_count = power_pellet_count
        self.clearance = power_pellet_clearance
    
    def place_pellets(self, grid):
        """Place pellets in classic Pac-Man style."""
        # Create a copy to modify
        result = [row[:] for row in grid]
        
        # Get all walkable cells
        walkable = self.get_walkable_cells(grid)
        
        if not walkable:
            return result
        
        # Find corners for power pellets
        corners = self._find_strategic_corners(grid, walkable)
        
        # Place power pellets
        power_pellet_locations = []
        if len(corners) >= self.power_pellet_count:
            # Use corners that are maximally separated
            power_pellet_locations = self._select_separated_locations(
                corners, self.power_pellet_count
            )
        else:
            # Use all corners and fill with dead ends
            power_pellet_locations = corners[:]
            dead_ends = [cell for cell in walkable if self.is_dead_end(grid, cell[0], cell[1])]
            remaining = self.power_pellet_count - len(power_pellet_locations)
            
            if dead_ends and remaining > 0:
                additional = self._select_separated_locations(dead_ends, remaining)
                power_pellet_locations.extend(additional)
        
        # Place power pellets
        for row, col in power_pellet_locations:
            result[row][col] = 3
        
        # Get cells in clearance zone around power pellets
        clearance_zone = set()
        for prow, pcol in power_pellet_locations:
            for row, col in walkable:
                distance = abs(row - prow) + abs(col - pcol)
                if distance <= self.clearance:
                    clearance_zone.add((row, col))
        
        # Place normal pellets on all other walkable cells
        for row, col in walkable:
            if result[row][col] == 0 and (row, col) not in clearance_zone:
                result[row][col] = 2
        
        return result
    
    def _find_strategic_corners(self, grid, walkable):
        """Find corner cells that are good for power pellets."""
        corners = []
        rows, cols = len(grid), len(grid[0])
        
        # Check actual corners of the maze
        corner_positions = [
            (1, 1), (1, cols - 2),
            (rows - 2, 1), (rows - 2, cols - 2)
        ]
        
        for row, col in corner_positions:
            if 0 <= row < rows and 0 <= col < cols and grid[row][col] == 0:
                corners.append((row, col))
        
        # Add dead ends that are far from borders
        for row, col in walkable:
            if self.is_dead_end(grid, row, col):
                if row > 2 and row < rows - 3 and col > 2 and col < cols - 3:
                    corners.append((row, col))
        
        return corners
    
    def _select_separated_locations(self, candidates, count):
        """Select locations that are maximally separated from each other."""
        if len(candidates) <= count:
            return candidates
        
        # Greedy selection: pick locations that maximize minimum distance
        selected = [candidates[0]]
        
        while len(selected) < count:
            best_candidate = None
            best_min_distance = -1
            
            for candidate in candidates:
                if candidate in selected:
                    continue
                
                # Calculate minimum distance to already selected locations
                min_distance = min(
                    abs(candidate[0] - s[0]) + abs(candidate[1] - s[1])
                    for s in selected
                )
                
                if min_distance > best_min_distance:
                    best_min_distance = min_distance
                    best_candidate = candidate
            
            if best_candidate:
                selected.append(best_candidate)
            else:
                break
        
        return selected

