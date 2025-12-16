"""
Random Walker - Moves randomly while avoiding ghosts at close range
"""

import random
from .base_pacman import BasePacmanAI


class RandomWalker(BasePacmanAI):
    """Random movement algorithm with basic ghost avoidance"""
    
    DANGER_DISTANCE = 2
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Move randomly but avoid positions next to ghosts
        
        Args:
            pacman_pos: (x, y) tuple of Pacman's position
            ghost_positions: List of ghost positions
            pellet_positions: List of pellet positions
        
        Returns:
            Next position (x, y)
        """
        neighbors = self.get_valid_neighbors(pacman_pos)
        
        if not neighbors:
            return pacman_pos
        
        # Filter out dangerous positions (too close to ghosts)
        safe_neighbors = []
        for neighbor in neighbors:
            is_safe = True
            for ghost_pos in ghost_positions:
                if self.distance(neighbor, ghost_pos) <= self.DANGER_DISTANCE:
                    is_safe = False
                    break
            if is_safe:
                safe_neighbors.append(neighbor)
        
        # If all positions are dangerous, choose least dangerous
        if not safe_neighbors:
            return max(neighbors, key=lambda n: min(
                self.distance(n, g) for g in ghost_positions
            ) if ghost_positions else 0)
        
        # Return random safe move
        return random.choice(safe_neighbors)
