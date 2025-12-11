"""Base class for maze generators using Strategy pattern."""

from abc import ABC, abstractmethod


class MazeGenerator(ABC):
    """
    Abstract base class for all maze generators.
    Implements the Strategy pattern for interchangeable algorithms.
    """
    
    @abstractmethod
    def generate(self, width, height):
        """
        Generate a maze with the specified dimensions.
        
        Args:
            width (int): Number of cells wide (3-50)
            height (int): Number of cells tall (3-50)
        
        Returns:
            tuple: (maze, remaining_walls)
                maze: List of lists representing walls
                remaining_walls: List of walls that weren't removed
        """
        pass
    
    def validate_dimensions(self, width, height):
        """Validate maze dimensions."""
        if not isinstance(width, int) or not isinstance(height, int):
            raise ValueError("Width and height must be integers")
        
        if width < 3 or width > 50:
            raise ValueError("Width must be between 3 and 50")
        
        if height < 3 or height > 50:
            raise ValueError("Height must be between 3 and 50")
    
    def initialize_maze(self, width, height):
        """
        Initialize a maze with all walls present.
        
        Returns:
            list: Maze structure with all walls
        """
        maze = []
        for y in range(2 * height - 1):
            if y % 2 == 0:
                # Horizontal walls row
                maze.append([True] * (width - 1))
            else:
                # Vertical walls row
                maze.append([True] * width)
        return maze
    
    def get_all_walls(self, width, height):
        """
        Get list of all possible walls in the maze.
        
        Returns:
            list: List of ((y, x), type) tuples where type is 'H' or 'V'
        """
        walls = []
        for y in range(height):
            for x in range(width):
                # Horizontal walls
                if x < width - 1:
                    walls.append(((y, x), 'H'))
                # Vertical walls
                if y < height - 1:
                    walls.append(((y, x), 'V'))
        return walls

