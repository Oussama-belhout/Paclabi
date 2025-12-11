"""Maze imperfection system for adding loops and tunnels."""

import random


class MazeImperfecteur:
    """
    Makes perfect mazes imperfect by adding loops and tunnels.
    
    Perfect mazes have exactly one path between any two points.
    Imperfect mazes have multiple paths (loops), making them more interesting.
    """
    
    def make_imperfect(self, maze, remaining_walls, imperfection_level,
                      width, height, tunnels_h=1, tunnels_v=0):
        """
        Make a maze imperfect by removing additional walls and adding tunnels.
        
        Args:
            maze: The maze structure
            remaining_walls: List of walls that can be removed
            imperfection_level: 0-100 percentage or 0.0-1.0 fraction
            width: Maze width
            height: Maze height
            tunnels_h: Number of horizontal tunnels (wraps left-right)
            tunnels_v: Number of vertical tunnels (wraps top-bottom)
        
        Returns:
            tuple: (modified_maze, horizontal_tunnel_rows, vertical_tunnel_cols)
        """
        # Normalize imperfection level to 0.0-1.0
        if imperfection_level > 1:
            imperfection_level = float(imperfection_level) / 100.0
        
        # Calculate number of walls to remove
        num_walls_to_remove = int(len(remaining_walls) * imperfection_level)
        
        # Ensure at least one wall is removed if level > 0
        if imperfection_level > 0 and num_walls_to_remove == 0 and remaining_walls:
            num_walls_to_remove = 1
        
        # Clamp to valid range
        num_walls_to_remove = max(0, min(num_walls_to_remove, len(remaining_walls)))
        
        # Remove random walls to create loops
        if num_walls_to_remove > 0:
            walls_to_remove = random.sample(remaining_walls, num_walls_to_remove)
            for (y, x), wall_type in walls_to_remove:
                if wall_type == 'H':
                    maze[2 * y][x] = False
                else:  # 'V'
                    maze[2 * y + 1][x] = False
        
        # Create symmetric tunnels
        tunnel_rows, tunnel_cols = self._create_tunnels(
            width, height, tunnels_h, tunnels_v
        )
        
        return maze, tunnel_rows, tunnel_cols
    
    def _create_tunnels(self, width, height, num_horizontal, num_vertical):
        """
        Select random rows/columns for tunnels.
        
        Returns:
            tuple: (set of row indices, set of column indices)
        """
        # Horizontal tunnels (select rows)
        possible_rows = list(range(height))
        num_horizontal = min(num_horizontal, height)
        tunnel_rows = set(random.sample(possible_rows, num_horizontal)) if num_horizontal > 0 else set()
        
        # Vertical tunnels (select columns)
        possible_cols = list(range(width))
        num_vertical = min(num_vertical, width)
        tunnel_cols = set(random.sample(possible_cols, num_vertical)) if num_vertical > 0 else set()
        
        return tunnel_rows, tunnel_cols

