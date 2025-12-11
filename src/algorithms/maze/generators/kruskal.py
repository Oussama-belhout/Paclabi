"""Kruskal's algorithm for maze generation."""

import random
from .base import MazeGenerator


class UnionFind:
    """
    Union-Find (Disjoint Set Union) data structure.
    Used for efficient cycle detection in Kruskal's algorithm.
    """
    
    def __init__(self, n):
        """Initialize n disjoint sets."""
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, i):
        """Find the root of the set containing i with path compression."""
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])  # Path compression
        return self.parent[i]
    
    def union(self, i, j):
        """
        Unite the sets containing i and j.
        
        Returns:
            bool: True if union was performed, False if already in same set
        """
        root_i = self.find(i)
        root_j = self.find(j)
        
        if root_i == root_j:
            return False  # Already in same set
        
        # Union by rank
        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1
        
        return True


class KruskalGenerator(MazeGenerator):
    """
    Kruskal's minimum spanning tree algorithm for maze generation.
    
    Creates mazes by treating cells as vertices and walls as edges,
    then building a minimum spanning tree using Union-Find.
    
    Characteristics:
    - Creates random mazes with short passages
    - Unbiased - all spanning trees equally likely
    - Fast: O(E log E) where E is number of edges
    """
    
    def generate(self, width, height):
        """Generate a perfect maze using Kruskal's algorithm."""
        self.validate_dimensions(width, height)
        
        # Initialize maze with all walls
        maze = self.initialize_maze(width, height)
        
        # Get all walls and shuffle them
        walls = self.get_all_walls(width, height)
        random.shuffle(walls)
        
        # Initialize Union-Find for all cells
        uf = UnionFind(width * height)
        remaining_walls = []
        
        # Process walls in random order
        for (y, x), wall_type in walls:
            # Calculate cell indices
            cell1_idx = y * width + x
            
            if wall_type == 'H':
                # Horizontal wall between (y,x) and (y,x+1)
                cell2_idx = y * width + (x + 1)
            else:  # 'V'
                # Vertical wall between (y,x) and (y+1,x)
                cell2_idx = (y + 1) * width + x
            
            # If cells are in different sets, remove wall and unite sets
            if uf.union(cell1_idx, cell2_idx):
                # Remove the wall
                if wall_type == 'H':
                    maze[2 * y][x] = False
                else:  # 'V'
                    maze[2 * y + 1][x] = False
            else:
                # Keep this wall (creates cycle)
                remaining_walls.append(((y, x), wall_type))
        
        return maze, remaining_walls

