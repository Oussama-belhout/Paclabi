"""Tests for ghost AI behaviors."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from algorithms.ghost_ai.blinky import BlinkyAgent
from algorithms.ghost_ai.pinky import PinkyAgent
from algorithms.ghost_ai.inky import InkyAgent
from algorithms.ghost_ai.clyde import ClydeAgent


class TestGhostAI:
    @pytest.fixture
    def simple_grid(self):
        return [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0]
        ]

    def test_blinky_chases_pacman(self, simple_grid):
        """Test that Blinky targets Pacman directly."""
        blinky = BlinkyAgent(simple_grid)
        blinky.set_position((0, 0))
        
        pacman_pos = (4, 4)
        target = blinky.get_target(pacman_pos)
        
        # Blinky should target Pacman's exact position
        assert target == pacman_pos

    def test_pinky_ambushes(self, simple_grid):
        """Test that Pinky targets ahead of Pacman."""
        pinky = PinkyAgent(simple_grid)
        pinky.set_position((0, 0))
        
        pacman_pos = (2, 2)
        pacman_dir = 'RIGHT'
        
        target = pinky.get_target(pacman_pos, pacman_dir)
        
        # Pinky should target ahead of Pacman
        # (exact position depends on grid, but should be different from Pacman)
        assert target != pacman_pos

    def test_inky_flanks(self, simple_grid):
        """Test that Inky uses Blinky's position for flanking."""
        inky = InkyAgent(simple_grid)
        inky.set_position((0, 0))
        
        pacman_pos = (2, 2)
        blinky_pos = (1, 1)
        other_ghosts = {'blinky': blinky_pos}
        
        target = inky.get_target(pacman_pos, 'RIGHT', other_ghosts)
        
        # Inky should calculate a complex target
        assert target is not None

    def test_clyde_scared_behavior(self, simple_grid):
        """Test that Clyde retreats when close to Pacman."""
        clyde = ClydeAgent(simple_grid, retreat_distance=5)
        clyde.set_position((0, 0))
        
        # Far from Pacman - should chase
        pacman_far = (4, 4)
        target_far = clyde.get_target(pacman_far)
        assert target_far == pacman_far
        
        # Close to Pacman - should retreat to scatter
        clyde.set_position((2, 2))
        pacman_close = (2, 3)
        target_close = clyde.get_target(pacman_close)
        assert target_close == clyde.scatter_target

    def test_ghost_movement(self, simple_grid):
        """Test that ghosts can find next move."""
        blinky = BlinkyAgent(simple_grid)
        blinky.set_position((0, 0))
        
        pacman_pos = (4, 4)
        next_move = blinky.get_next_move(pacman_pos)
        
        assert next_move is not None
        # Next move should be adjacent to current position
        dist = abs(next_move[0] - 0) + abs(next_move[1] - 0)
        assert dist == 1

    def test_ghost_distance_calculation(self, simple_grid):
        """Test ghost distance calculations."""
        blinky = BlinkyAgent(simple_grid)
        blinky.set_position((0, 0))
        
        target = (3, 4)
        distance = blinky.distance_to(target)
        
        # Manhattan distance from (0,0) to (3,4) is 7
        assert distance == 7

    def test_all_ghosts_unique_behaviors(self, simple_grid):
        """Test that each ghost has unique behavior."""
        pacman_pos = (2, 2)
        blinky_pos = (1, 1)
        other_ghosts = {'blinky': blinky_pos}
        
        blinky = BlinkyAgent(simple_grid)
        pinky = PinkyAgent(simple_grid)
        inky = InkyAgent(simple_grid)
        clyde = ClydeAgent(simple_grid)
        
        for ghost in [blinky, pinky, inky, clyde]:
            ghost.set_position((0, 0))
        
        blinky_target = blinky.get_target(pacman_pos)
        pinky_target = pinky.get_target(pacman_pos, 'RIGHT')
        inky_target = inky.get_target(pacman_pos, 'RIGHT', other_ghosts)
        clyde_target = clyde.get_target(pacman_pos)
        
        # At least some targets should be different
        targets = [blinky_target, pinky_target, inky_target, clyde_target]
        assert len(set(targets)) > 1

