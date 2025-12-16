"""
Aggressive Pacman - Focuses on collecting pellets quickly
"""

from .base_pacman import BasePacmanAI


class AggressivePacman(BasePacmanAI):
    """Aggressive algorithm - prioritizes pellet collection, takes risks"""
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Move towards pellets aggressively, only avoiding ghosts at last moment
        
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
        
        # If no pellets, move randomly
        if not pellet_positions:
            return neighbors[0]
        
        best_move = neighbors[0]
        best_score = float('-inf')
        
        for neighbor in neighbors:
            score = 0
            
            # Strongly prefer moves towards nearest pellet
            nearest_pellet = min(pellet_positions, key=lambda p: self.distance(neighbor, p))
            pellet_dist = self.distance(neighbor, nearest_pellet)
            score -= pellet_dist * 100
            
            # Only avoid ghosts if they're very close (1 or 2 steps away)
            for ghost_pos in ghost_positions:
                ghost_dist = self.distance(neighbor, ghost_pos)
                if ghost_dist <= 1:
                    # Only avoid immediate danger
                    score -= 1000
                elif ghost_dist == 2:
                    # Slight penalty for being 2 steps away
                    score -= 50
            
            if score > best_score:
                best_score = score
                best_move = neighbor
        
        return best_move
