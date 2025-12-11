"""Prim's algorithm for maze generation."""

import random
from .base import MazeGenerator


class PrimGenerator(MazeGenerator):
    """
    Randomized Prim's algorithm for maze generation.
    
    Grows the maze from a starting cell by randomly selecting
    walls from the frontier and expanding into unvisited cells.
    
    Characteristics:
    - Creates organic-looking mazes with branching passages
    - Tends to have shorter dead-ends than DFS
    - Medium speed: O(E log V)
    - Produces mazes with a more "natural" feel
    """
    
    def generate(self, width, height):
        """Generate a perfect maze using Prim's algorithm."""
        self.validate_dimensions(width, height)
        
        # Initialize maze with all walls
        maze = self.initialize_maze(width, height)
        
        # Track visited cells and frontier walls
        visited = set()
        frontier_walls = []
        remaining_walls = []
        
        # Start from a random cell
        start_y = random.randint(0, height - 1)
        start_x = random.randint(0, width - 1)
        visited.add((start_y, start_x))
        
        # Add walls of starting cell to frontier
        self._add_walls_to_frontier(start_y, start_x, width, height, frontier_walls)
        
        # Process frontier walls
        while frontier_walls:
            # Pick a random wall from frontier
            wall = random.choice(frontier_walls)
            frontier_walls.remove(wall)
            
            (y, x), wall_type = wall
            
            # Determine the two cells separated by this wall
            if wall_type == 'H':
                cell1 = (y, x)
                cell2 = (y, x + 1)
            else:  # 'V'
                cell1 = (y, x)
                cell2 = (y + 1, x)
            
            # Check if exactly one cell is visited
            cell1_visited = cell1 in visited
            cell2_visited = cell2 in visited
            
            if cell1_visited and not cell2_visited:
                # Remove wall and add cell2 to visited
                self._remove_wall(maze, y, x, wall_type)
                visited.add(cell2)
                self._add_walls_to_frontier(cell2[0], cell2[1], width, height, frontier_walls)
                
            elif cell2_visited and not cell1_visited:
                # Remove wall and add cell1 to visited
                self._remove_wall(maze, y, x, wall_type)
                visited.add(cell1)
                self._add_walls_to_frontier(cell1[0], cell1[1], width, height, frontier_walls)
            else:
                # Both visited or both unvisited - keep wall
                remaining_walls.append(wall)
        
        # Collect remaining walls
        all_walls = self.get_all_walls(width, height)
        for wall in all_walls:
            (y, x), wall_type = wall
            if wall_type == 'H' and maze[2 * y][x]:
                if wall not in remaining_walls:
                    remaining_walls.append(wall)
            elif wall_type == 'V' and maze[2 * y + 1][x]:
                if wall not in remaining_walls:
                    remaining_walls.append(wall)
        
        return maze, remaining_walls
    
    def _add_walls_to_frontier(self, y, x, width, height, frontier):
        """Add walls of a cell to the frontier."""
        # Right wall
        if x < width - 1:
            frontier.append(((y, x), 'H'))
        
        # Bottom wall
        if y < height - 1:
            frontier.append(((y, x), 'V'))
        
        # Left wall
        if x > 0:
            frontier.append(((y, x - 1), 'H'))
        
        # Top wall
        if y > 0:
            frontier.append(((y - 1, x), 'V'))
    
    def _remove_wall(self, maze, y, x, wall_type):
        """Remove a wall from the maze."""
        if wall_type == 'H':
            maze[2 * y][x] = False
        else:  # 'V'
            maze[2 * y + 1][x] = False

