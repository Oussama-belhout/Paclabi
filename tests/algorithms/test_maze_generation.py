"""Tests for maze generation algorithms."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from algorithms.maze.generators import (
    KruskalGenerator,
    PrimGenerator,
    RecursiveBacktrackerGenerator,
    WilsonGenerator
)


class TestMazeGenerators:
    @pytest.fixture(params=[
        KruskalGenerator,
        PrimGenerator,
        RecursiveBacktrackerGenerator,
        WilsonGenerator
    ])
    def generator(self, request):
        return request.param()

    def test_generate_valid_maze(self, generator):
        """Test that generated maze has correct structure."""
        width, height = 10, 8
        maze, remaining_walls = generator.generate(width, height)

        # Check maze dimensions
        expected_rows = 2 * height - 1
        assert len(maze) == expected_rows

        # Check that maze is not all walls
        has_path = False
        for row in maze:
            if False in row:
                has_path = True
                break
        assert has_path, "Maze should have at least one path"

    def test_generate_small_maze(self, generator):
        """Test minimum size maze (3x3)."""
        maze, remaining_walls = generator.generate(3, 3)
        assert len(maze) == 5  # 2*3-1

    def test_generate_large_maze(self, generator):
        """Test large maze (50x50)."""
        maze, remaining_walls = generator.generate(50, 50)
        assert len(maze) == 99  # 2*50-1

    def test_invalid_dimensions(self, generator):
        """Test that invalid dimensions raise errors."""
        with pytest.raises(ValueError):
            generator.generate(2, 10)  # Too small
        
        with pytest.raises(ValueError):
            generator.generate(51, 10)  # Too large
        
        with pytest.raises(ValueError):
            generator.generate(10, 0)  # Zero height

    def test_maze_connectivity(self, generator):
        """Test that generated maze is connected (perfect maze)."""
        width, height = 10, 8
        maze, remaining_walls = generator.generate(width, height)

        # Count paths (cells)
        total_cells = width * height
        
        # A perfect maze should have exactly (total_cells - 1) passages
        # This means (total_cells - 1) walls were removed
        # We can verify the maze is a spanning tree
        
        # Count removed walls
        removed_walls = 0
        for y in range(height):
            for x in range(width - 1):
                if not maze[2 * y][x]:
                    removed_walls += 1
        
        for y in range(height - 1):
            for x in range(width):
                if not maze[2 * y + 1][x]:
                    removed_walls += 1
        
        # Perfect maze property: removed walls = cells - 1
        assert removed_walls == total_cells - 1


class TestKruskalSpecific:
    def test_union_find(self):
        """Test UnionFind data structure."""
        from algorithms.maze.generators.kruskal import UnionFind
        
        uf = UnionFind(5)
        
        # Initially all separate
        assert uf.find(0) != uf.find(1)
        
        # Union should succeed
        assert uf.union(0, 1)
        assert uf.find(0) == uf.find(1)
        
        # Union again should fail
        assert not uf.union(0, 1)


class TestWilsonSpecific:
    def test_loop_erased_walk(self):
        """Test that Wilson's algorithm produces valid mazes."""
        generator = WilsonGenerator()
        maze, remaining_walls = generator.generate(10, 10)
        
        # Wilson's algorithm should produce unbiased spanning trees
        assert len(maze) == 19  # 2*10-1

