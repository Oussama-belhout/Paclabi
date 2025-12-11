"""Tests for pathfinding algorithms."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from algorithms.pathfinding.astar import AStar
from algorithms.pathfinding.bfs import BFS


class TestAStar:
    @pytest.fixture
    def simple_grid(self):
        """Simple 5x5 grid with walls."""
        return [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0]
        ]

    def test_find_simple_path(self, simple_grid):
        """Test finding a simple path."""
        astar = AStar(simple_grid)
        path = astar.find_path((0, 0), (4, 4))
        
        assert path is not None
        assert path[0] == (0, 0)
        assert path[-1] == (4, 4)
        assert len(path) > 0

    def test_no_path_exists(self):
        """Test when no path exists."""
        grid = [
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0]
        ]
        
        astar = AStar(grid)
        path = astar.find_path((0, 0), (0, 4))
        
        assert path is None

    def test_start_equals_goal(self, simple_grid):
        """Test when start equals goal."""
        astar = AStar(simple_grid)
        path = astar.find_path((2, 2), (2, 2))
        
        assert path == [(2, 2)]

    def test_optimal_path(self, simple_grid):
        """Test that A* finds optimal path."""
        astar = AStar(simple_grid)
        path = astar.find_path((0, 0), (0, 4))
        
        # Shortest path in simple grid should be 5 cells
        assert len(path) == 5

    def test_dict_position_format(self, simple_grid):
        """Test with dictionary position format."""
        astar = AStar(simple_grid)
        start = {'x': 0, 'y': 0}
        goal = {'x': 4, 'y': 4}
        
        path = astar.find_path(start, goal)
        assert path is not None

    def test_find_next_move(self, simple_grid):
        """Test finding just the next move."""
        astar = AStar(simple_grid)
        next_pos = astar.find_next_move((0, 0), (4, 4))
        
        assert next_pos is not None
        # Next position should be adjacent
        assert abs(next_pos[0] - 0) + abs(next_pos[1] - 0) == 1


class TestBFS:
    @pytest.fixture
    def simple_grid(self):
        return [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0]
        ]

    def test_bfs_finds_path(self, simple_grid):
        """Test BFS pathfinding."""
        bfs = BFS(simple_grid)
        path = bfs.find_path((0, 0), (4, 4))
        
        assert path is not None
        assert path[0] == (0, 0)
        assert path[-1] == (4, 4)

    def test_bfs_optimal(self, simple_grid):
        """Test that BFS finds optimal path."""
        bfs = BFS(simple_grid)
        path = bfs.find_path((0, 0), (0, 4))
        
        # BFS should also find optimal path for unweighted graphs
        assert len(path) == 5

    def test_bfs_vs_astar(self, simple_grid):
        """Compare BFS and A* results."""
        bfs = BFS(simple_grid)
        astar = AStar(simple_grid)
        
        bfs_path = bfs.find_path((0, 0), (4, 4))
        astar_path = astar.find_path((0, 0), (4, 4))
        
        # Both should find paths of same length
        assert len(bfs_path) == len(astar_path)

