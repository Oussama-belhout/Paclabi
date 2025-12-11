"""Tests for distance calculations."""

import pytest
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from algorithms.utils.distance import manhattan_distance, euclidean_distance, chebyshev_distance


class TestManhattanDistance:
    def test_manhattan_distance_tuple(self):
        assert manhattan_distance((0, 0), (3, 4)) == 7
        assert manhattan_distance((1, 1), (1, 1)) == 0
        assert manhattan_distance((5, 5), (2, 3)) == 5

    def test_manhattan_distance_dict(self):
        pos1 = {'x': 0, 'y': 0}
        pos2 = {'x': 3, 'y': 4}
        assert manhattan_distance(pos1, pos2) == 7

    def test_manhattan_distance_negative(self):
        assert manhattan_distance((-1, -1), (2, 3)) == 7

    def test_manhattan_distance_mixed_format(self):
        pos1 = (1, 2)
        pos2 = {'x': 4, 'y': 6}
        assert manhattan_distance(pos1, pos2) == 7


class TestEuclideanDistance:
    def test_euclidean_distance_tuple(self):
        assert euclidean_distance((0, 0), (3, 4)) == 5.0
        assert euclidean_distance((1, 1), (1, 1)) == 0.0

    def test_euclidean_distance_dict(self):
        pos1 = {'x': 0, 'y': 0}
        pos2 = {'x': 3, 'y': 4}
        assert euclidean_distance(pos1, pos2) == 5.0


class TestChebyshevDistance:
    def test_chebyshev_distance_tuple(self):
        assert chebyshev_distance((0, 0), (3, 4)) == 4
        assert chebyshev_distance((5, 5), (2, 3)) == 3

    def test_chebyshev_distance_dict(self):
        pos1 = {'x': 0, 'y': 0}
        pos2 = {'x': 3, 'y': 4}
        assert chebyshev_distance(pos1, pos2) == 4

