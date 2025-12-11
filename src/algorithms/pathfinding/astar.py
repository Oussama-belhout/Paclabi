"""A* pathfinding algorithm with Manhattan distance heuristic."""

import heapq
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.distance import manhattan_distance


class AStar:
    """
    A* pathfinding algorithm optimized for grid-based movement.
    
    Uses Manhattan distance as the heuristic (h-function) which is
    admissible and consistent for 4-directional grid movement.
    
    Guarantees optimal path when movement cost is uniform.
    Time complexity: O(b^d) where b is branching factor, d is depth
    Space complexity: O(b^d) for storing the frontier
    """
    
    def __init__(self, grid):
        """
        Initialize A* pathfinder.
        
        Args:
            grid: 2D array where 0=walkable, non-zero=blocked
        """
        self.grid = grid
        self.rows = len(grid)
        self.cols = len(grid[0]) if grid else 0
    
    def find_path(self, start, goal):
        """
        Find optimal path from start to goal using A*.
        
        Args:
            start: Tuple (row, col) or dict {'x': col, 'y': row}
            goal: Tuple (row, col) or dict {'x': col, 'y': row}
        
        Returns:
            list: Path as list of (row, col) tuples, or None if no path exists
        """
        # Normalize input
        start_pos = self._normalize_position(start)
        goal_pos = self._normalize_position(goal)
        
        # Validate positions
        if not self._is_valid(start_pos) or not self._is_valid(goal_pos):
            return None
        
        # Initialize data structures
        # Priority queue: (f_score, counter, position)
        counter = 0
        frontier = [(0, counter, start_pos)]
        counter += 1
        
        # Track visited nodes
        came_from = {}
        
        # g_score: cost from start to node
        g_score = {start_pos: 0}
        
        # f_score: g_score + heuristic (estimated total cost)
        f_score = {start_pos: manhattan_distance(start_pos, goal_pos)}
        
        while frontier:
            current_f, _, current = heapq.heappop(frontier)
            
            # Goal reached
            if current == goal_pos:
                return self._reconstruct_path(came_from, current)
            
            # Explore neighbors
            for neighbor in self._get_neighbors(current):
                # Calculate tentative g_score
                tentative_g = g_score[current] + 1  # Assuming uniform cost
                
                # If this path to neighbor is better than previous
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    # Record this path
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + manhattan_distance(neighbor, goal_pos)
                    
                    # Add to frontier if not already there
                    heapq.heappush(frontier, (f_score[neighbor], counter, neighbor))
                    counter += 1
        
        # No path found
        return None
    
    def find_next_move(self, start, goal):
        """
        Find the next move in the optimal path.
        
        Args:
            start: Current position
            goal: Target position
        
        Returns:
            tuple: Next position (row, col) or None if no path
        """
        path = self.find_path(start, goal)
        if path and len(path) > 1:
            return path[1]  # Return next position (path[0] is current)
        return None
    
    def _normalize_position(self, pos):
        """Convert position to (row, col) tuple."""
        if isinstance(pos, dict):
            return (pos['y'], pos['x'])
        return tuple(pos)
    
    def _is_valid(self, pos):
        """Check if position is valid and walkable."""
        row, col = pos
        return (0 <= row < self.rows and 
                0 <= col < self.cols and 
                self.grid[row][col] == 0)
    
    def _get_neighbors(self, pos):
        """Get valid neighboring cells (4-directional movement)."""
        row, col = pos
        neighbors = []
        
        # Check all 4 directions: up, down, left, right
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            new_row, new_col = row + dr, col + dc
            new_pos = (new_row, new_col)
            
            if self._is_valid(new_pos):
                neighbors.append(new_pos)
        
        return neighbors
    
    def _reconstruct_path(self, came_from, current):
        """Reconstruct path from start to goal."""
        path = [current]
        
        while current in came_from:
            current = came_from[current]
            path.append(current)
        
        path.reverse()
        return path

