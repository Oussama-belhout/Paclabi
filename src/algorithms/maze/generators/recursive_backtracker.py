"""Recursive backtracker (DFS) algorithm for maze generation."""

import random
from .base import MazeGenerator


class RecursiveBacktrackerGenerator(MazeGenerator):
    """
    Recursive backtracking (randomized depth-first search) for maze generation.
    
    Creates mazes by carving passages through depth-first exploration
    with backtracking when hitting dead ends.
    
    Characteristics:
    - Creates mazes with long, winding corridors
    - High "river" factor - tends to have few branches
    - Fast: O(V) where V is number of vertices
    - Very popular algorithm, creates challenging mazes
    - Low branching factor makes it harder to solve
    """
    
    def generate(self, width, height):
        """Generate a perfect maze using recursive backtracking."""
        self.validate_dimensions(width, height)
        
        # Initialize maze with all walls
        maze = self.initialize_maze(width, height)
        
        # Track visited cells
        visited = set()
        
        # Start from a random cell
        start_y = random.randint(0, height - 1)
        start_x = random.randint(0, width - 1)
        
        # Use iterative approach to avoid stack overflow
        stack = [(start_y, start_x)]
        visited.add((start_y, start_x))
        
        while stack:
            current_y, current_x = stack[-1]
            
            # Get unvisited neighbors
            neighbors = self._get_unvisited_neighbors(
                current_y, current_x, width, height, visited
            )
            
            if neighbors:
                # Choose a random unvisited neighbor
                next_y, next_x, direction = random.choice(neighbors)
                
                # Remove wall between current and next cell
                self._carve_passage(maze, current_y, current_x, direction)
                
                # Mark neighbor as visited and add to stack
                visited.add((next_y, next_x))
                stack.append((next_y, next_x))
            else:
                # No unvisited neighbors, backtrack
                stack.pop()
        
        # Collect remaining walls
        remaining_walls = []
        all_walls = self.get_all_walls(width, height)
        
        for (y, x), wall_type in all_walls:
            if wall_type == 'H' and maze[2 * y][x]:
                remaining_walls.append(((y, x), wall_type))
            elif wall_type == 'V' and maze[2 * y + 1][x]:
                remaining_walls.append(((y, x), wall_type))
        
        return maze, remaining_walls
    
    def _get_unvisited_neighbors(self, y, x, width, height, visited):
        """
        Get list of unvisited neighboring cells.
        
        Returns:
            list: List of (neighbor_y, neighbor_x, direction) tuples
        """
        neighbors = []
        
        # North
        if y > 0 and (y - 1, x) not in visited:
            neighbors.append((y - 1, x, 'N'))
        
        # South
        if y < height - 1 and (y + 1, x) not in visited:
            neighbors.append((y + 1, x, 'S'))
        
        # West
        if x > 0 and (y, x - 1) not in visited:
            neighbors.append((y, x - 1, 'W'))
        
        # East
        if x < width - 1 and (y, x + 1) not in visited:
            neighbors.append((y, x + 1, 'E'))
        
        return neighbors
    
    def _carve_passage(self, maze, y, x, direction):
        """Carve a passage in the specified direction."""
        if direction == 'N':
            # Remove vertical wall above
            maze[2 * y - 1][x] = False
        elif direction == 'S':
            # Remove vertical wall below
            maze[2 * y + 1][x] = False
        elif direction == 'W':
            # Remove horizontal wall to the left
            maze[2 * y][x - 1] = False
        elif direction == 'E':
            # Remove horizontal wall to the right
            maze[2 * y][x] = False

