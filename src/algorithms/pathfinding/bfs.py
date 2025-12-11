"""Breadth-First Search pathfinding algorithm."""

from collections import deque


class BFS:
    """
    Breadth-First Search pathfinding algorithm.
    
    Finds the shortest path in unweighted graphs.
    Simpler than A* but explores more nodes.
    
    Guarantees optimal path for unweighted graphs.
    Time complexity: O(V + E) where V=vertices, E=edges
    Space complexity: O(V) for the queue
    """
    
    def __init__(self, grid):
        """
        Initialize BFS pathfinder.
        
        Args:
            grid: 2D array where 0=walkable, non-zero=blocked
        """
        self.grid = grid
        self.rows = len(grid)
        self.cols = len(grid[0]) if grid else 0
    
    def find_path(self, start, goal):
        """
        Find shortest path from start to goal using BFS.
        
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
        
        # Initialize BFS
        queue = deque([start_pos])
        came_from = {start_pos: None}
        
        while queue:
            current = queue.popleft()
            
            # Goal reached
            if current == goal_pos:
                return self._reconstruct_path(came_from, current)
            
            # Explore neighbors
            for neighbor in self._get_neighbors(current):
                if neighbor not in came_from:
                    came_from[neighbor] = current
                    queue.append(neighbor)
        
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
            return path[1]  # Return next position
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
        
        while came_from[current] is not None:
            current = came_from[current]
            path.append(current)
        
        path.reverse()
        return path

