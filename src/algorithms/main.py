#!/usr/bin/env python3
"""
Main entry point for Pacman Lab algorithms.
Provides CLI interface for maze generation, pellet placement, and simulation.
"""

import sys
import os
import json
import argparse

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from maze.generators import (
    KruskalGenerator,
    PrimGenerator,
    RecursiveBacktrackerGenerator,
    WilsonGenerator
)
from maze.imperfecteur import MazeImperfecteur
from maze.pellets import (
    RandomPelletPlacer,
    StrategicPelletPlacer,
    ClassicPelletPlacer
)
from utils.maze_converter import internal_to_grid
from simulation.game_engine import GameEngine


def generate_maze(args):
    """Generate a maze based on command arguments."""
    width = args.width
    height = args.height
    algorithm = args.algorithm.lower()
    imperfection = args.imperfection
    tunnels_h = args.tunnels_h
    tunnels_v = args.tunnels_v
    
    # Select generator
    generators = {
        'kruskal': KruskalGenerator(),
        'prim': PrimGenerator(),
        'recursive_backtracker': RecursiveBacktrackerGenerator(),
        'wilson': WilsonGenerator()
    }
    
    if algorithm not in generators:
        return {'error': f'Unknown algorithm: {algorithm}'}
    
    try:
        # Generate maze
        generator = generators[algorithm]
        maze, remaining_walls = generator.generate(width, height)
        
        # Make imperfect if requested
        imperfecteur = MazeImperfecteur()
        maze, tunnel_rows, tunnel_cols = imperfecteur.make_imperfect(
            maze, remaining_walls, imperfection, width, height, tunnels_h, tunnels_v
        )
        
        # Convert to grid format
        grid = internal_to_grid(maze, width, height, tunnel_rows, tunnel_cols)
        
        return {
            'success': True,
            'grid': grid,
            'width': width,
            'height': height,
            'algorithm': algorithm,
            'imperfection': imperfection,
            'tunnels': {
                'horizontal': list(tunnel_rows),
                'vertical': list(tunnel_cols)
            }
        }
    except Exception as e:
        return {'error': str(e)}


def place_pellets(args):
    """Place pellets on a maze grid."""
    # Load grid from stdin or file
    if args.grid_file:
        with open(args.grid_file, 'r') as f:
            data = json.load(f)
            grid = data['grid']
    else:
        grid = json.loads(args.grid_json)
    
    algorithm = args.algorithm.lower()
    
    # Select pellet placer
    placers = {
        'random': RandomPelletPlacer(density=args.density),
        'strategic': StrategicPelletPlacer(
            corridor_density=args.corridor_density,
            junction_density=args.junction_density
        ),
        'classic': ClassicPelletPlacer()
    }
    
    if algorithm not in placers:
        return {'error': f'Unknown pellet algorithm: {algorithm}'}
    
    try:
        placer = placers[algorithm]
        result_grid = placer.place_pellets(grid)
        
        return {
            'success': True,
            'grid': result_grid,
            'algorithm': algorithm
        }
    except Exception as e:
        return {'error': str(e)}


def simulate_game(args):
    """Simulate a game with ghosts."""
    # Load data
    with open(args.trajectory_file, 'r') as f:
        trajectory_data = json.load(f)
    
    trajectory = trajectory_data.get('moves', [])
    
    with open(args.grid_file, 'r') as f:
        grid_data = json.load(f)
        grid = grid_data['grid']
    
    ghost_configs = json.loads(args.ghost_configs)
    
    try:
        engine = GameEngine(grid, ghost_configs)
        results = engine.simulate(trajectory)
        
        return {
            'success': True,
            **results
        }
    except Exception as e:
        return {'error': str(e)}


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description='Pacman Lab Algorithms')
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Maze generation command
    maze_parser = subparsers.add_parser('generate', help='Generate a maze')
    maze_parser.add_argument('width', type=int, help='Maze width (3-50)')
    maze_parser.add_argument('height', type=int, help='Maze height (3-50)')
    maze_parser.add_argument('--algorithm', default='kruskal',
                           choices=['kruskal', 'prim', 'recursive_backtracker', 'wilson'],
                           help='Generation algorithm')
    maze_parser.add_argument('--imperfection', type=float, default=0,
                           help='Imperfection level (0-100 or 0.0-1.0)')
    maze_parser.add_argument('--tunnels-h', type=int, default=1,
                           help='Number of horizontal tunnels')
    maze_parser.add_argument('--tunnels-v', type=int, default=0,
                           help='Number of vertical tunnels')
    
    # Pellet placement command
    pellet_parser = subparsers.add_parser('pellets', help='Place pellets')
    pellet_parser.add_argument('--grid-file', help='JSON file with grid')
    pellet_parser.add_argument('--grid-json', help='Grid as JSON string')
    pellet_parser.add_argument('--algorithm', default='strategic',
                             choices=['random', 'strategic', 'classic'],
                             help='Pellet placement algorithm')
    pellet_parser.add_argument('--density', type=float, default=0.7,
                             help='Pellet density for random algorithm')
    pellet_parser.add_argument('--corridor-density', type=float, default=0.8,
                             help='Corridor density for strategic algorithm')
    pellet_parser.add_argument('--junction-density', type=float, default=0.4,
                             help='Junction density for strategic algorithm')
    
    # Simulation command
    sim_parser = subparsers.add_parser('simulate', help='Simulate game with ghosts')
    sim_parser.add_argument('--trajectory-file', required=True,
                          help='JSON file with recorded trajectory')
    sim_parser.add_argument('--grid-file', required=True,
                          help='JSON file with maze grid')
    sim_parser.add_argument('--ghost-configs', required=True,
                          help='Ghost configurations as JSON string')
    
    args = parser.parse_args()
    
    # Execute command
    if args.command == 'generate':
        result = generate_maze(args)
    elif args.command == 'pellets':
        result = place_pellets(args)
    elif args.command == 'simulate':
        result = simulate_game(args)
    else:
        parser.print_help()
        sys.exit(1)
    
    # Output result as JSON
    print(json.dumps(result))


if __name__ == '__main__':
    main()

