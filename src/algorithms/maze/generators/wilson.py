"""Wilson's algorithm for maze generation."""

import random
from .base import MazeGenerator


class WilsonGenerator(MazeGenerator):
    """
    Wilson's algorithm for maze generation using loop-erased random walks.
    
    Generates unbiased uniform spanning trees - every possible maze
    of the given dimensions has equal probability of being generated.
    
    Characteristics:
    - Produces truly unbiased mazes
    - Slower than other algorithms, especially at the start
    - Creates balanced mazes with no particular bias
    - Based on loop-erased random walks
    - Mathematically elegant and provably uniform
    """
    
    def generate(self, width, height):
        """Generate a perfect maze using Wilson's algorithm."""
        self.validate_dimensions(width, height)
        
        # Initialize maze with all walls
        maze = self.initialize_maze(width, height)
        
        # Track which cells are part of the maze
        in_maze = set()
        
        # Add a random starting cell to the maze
        start_y = random.randint(0, height - 1)
        start_x = random.randint(0, width - 1)
        in_maze.add((start_y, start_x))
        
        # Get all cells
        all_cells = [(y, x) for y in range(height) for x in range(width)]
        
        # Process remaining cells
        while len(in_maze) < width * height:
            # Pick a random cell not in the maze
            current = random.choice([c for c in all_cells if c not in in_maze])
            
            # Perform loop-erased random walk until we hit the maze
            path = self._loop_erased_random_walk(current, in_maze, width, height)
            
            # Add the path to the maze
            for i in range(len(path) - 1):
                y1, x1 = path[i]
                y2, x2 = path[i + 1]
                
                # Carve passage between cells
                self._carve_between(maze, y1, x1, y2, x2)
                in_maze.add((y1, x1))
            
            # Last cell should already be in maze
            in_maze.add(path[-1])
        
        # Collect remaining walls
        remaining_walls = []
        all_walls = self.get_all_walls(width, height)
        
        for (y, x), wall_type in all_walls:
            if wall_type == 'H' and maze[2 * y][x]:
                remaining_walls.append(((y, x), wall_type))
            elif wall_type == 'V' and maze[2 * y + 1][x]:
                remaining_walls.append(((y, x), wall_type))
        
        return maze, remaining_walls
    
    def _loop_erased_random_walk(self, start, in_maze, width, height):
        """
        Perform a loop-erased random walk from start until hitting the maze.
        
        Returns:
            list: Path from start to maze (loops removed)
        """
        path = [start]
        position_to_index = {start: 0}
        
        current = start
        
        while current not in in_maze:
            # Get valid neighbors
            neighbors = []
            y, x = current
            
            if y > 0:
                neighbors.append((y - 1, x))
            if y < height - 1:
                neighbors.append((y + 1, x))
            if x > 0:
                neighbors.append((y, x - 1))
            if x < width - 1:
                neighbors.append((y, x + 1))
            
            # Move to random neighbor
            next_cell = random.choice(neighbors)
            
            # Check if we've created a loop
            if next_cell in position_to_index:
                # Erase the loop by cutting path back
                loop_start_idx = position_to_index[next_cell]
                path = path[:loop_start_idx + 1]
                
                # Rebuild position index
                position_to_index = {cell: idx for idx, cell in enumerate(path)}
            else:
                # Add to path
                path.append(next_cell)
                position_to_index[next_cell] = len(path) - 1
            
            current = next_cell
        
        return path
    
    def _carve_between(self, maze, y1, x1, y2, x2):
        """Carve a passage between two adjacent cells."""
        if y1 == y2:
            # Horizontal passage
            if x1 < x2:
                maze[2 * y1][x1] = False
            else:
                maze[2 * y1][x2] = False
        else:
            # Vertical passage
            if y1 < y2:
                maze[2 * y1 + 1][x1] = False
            else:
                maze[2 * y2 + 1][x1] = False

