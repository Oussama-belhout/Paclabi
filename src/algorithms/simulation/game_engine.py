"""Game simulation engine for replaying trajectories with ghosts."""

import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ghost_ai.blinky import BlinkyAgent
from ghost_ai.pinky import PinkyAgent
from ghost_ai.inky import InkyAgent
from ghost_ai.clyde import ClydeAgent


class GameEngine:
    """
    Simulates Pacman gameplay with ghosts.
    Replays a recorded trajectory and simulates ghost behavior.
    """
    
    def __init__(self, grid, ghost_configs):
        """
        Initialize game engine.
        
        Args:
            grid: 2D maze grid (0=walkable)
            ghost_configs: List of ghost configurations
                [{'type': 'blinky', 'algorithm': 'astar', 'startPos': (row, col)}, ...]
        """
        self.grid = grid
        self.ghosts = []
        
        # Initialize ghosts based on configurations
        ghost_classes = {
            'blinky': BlinkyAgent,
            'pinky': PinkyAgent,
            'inky': InkyAgent,
            'clyde': ClydeAgent
        }
        
        for config in ghost_configs:
            ghost_type = config.get('type', 'blinky').lower()
            algorithm = config.get('algorithm', 'astar')
            start_pos = config.get('startPos')
            
            if ghost_type in ghost_classes:
                ghost = ghost_classes[ghost_type](grid, algorithm)
                
                if start_pos:
                    # Normalize position format
                    if isinstance(start_pos, dict):
                        start_pos = (start_pos['y'], start_pos['x'])
                    ghost.set_position(start_pos)
                
                self.ghosts.append({
                    'agent': ghost,
                    'type': ghost_type,
                    'position': start_pos
                })
    
    def simulate(self, trajectory):
        """
        Simulate a game with the given Pacman trajectory.
        
        Args:
            trajectory: List of Pacman positions/moves
                [{'position': {'x': , 'y': }, 'timestamp': , ...}, ...]
        
        Returns:
            dict: Simulation results
        """
        frames = []
        caught = False
        catch_position = None
        catch_time = None
        
        # Get other ghost positions for Inky's calculation
        def get_ghost_positions():
            return {
                ghost['type']: ghost['position']
                for ghost in self.ghosts
            }
        
        # Simulate each frame
        for i, move in enumerate(trajectory):
            # Get Pacman position
            pacman_pos = move.get('position', {})
            if isinstance(pacman_pos, dict):
                pacman_pos = (pacman_pos.get('y'), pacman_pos.get('x'))
            
            pacman_dir = move.get('direction')
            timestamp = move.get('timestamp', i * 100)
            
            # Update each ghost
            ghost_positions = []
            other_ghosts = get_ghost_positions()
            
            for ghost in self.ghosts:
                agent = ghost['agent']
                
                # Get next move for this ghost
                next_pos = agent.get_next_move(
                    pacman_pos,
                    pacman_dir,
                    other_ghosts
                )
                
                if next_pos:
                    agent.set_position(next_pos)
                    ghost['position'] = next_pos
                
                ghost_positions.append({
                    'type': ghost['type'],
                    'position': {'y': ghost['position'][0], 'x': ghost['position'][1]}
                })
                
                # Check collision
                if ghost['position'] == pacman_pos and not caught:
                    caught = True
                    catch_position = {'y': pacman_pos[0], 'x': pacman_pos[1]}
                    catch_time = timestamp
            
            # Record frame
            frames.append({
                'timestamp': timestamp,
                'pacman': {'y': pacman_pos[0], 'x': pacman_pos[1]},
                'ghosts': ghost_positions,
                'caught': caught
            })
            
            # Stop if caught
            if caught:
                break
        
        return {
            'caught': caught,
            'catchPosition': catch_position,
            'catchTime': catch_time,
            'totalFrames': len(frames),
            'frames': frames
        }

