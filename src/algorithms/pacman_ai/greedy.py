"""
Greedy Pacman - Always moves towards nearest pellet
"""

from .base_pacman import BasePacmanAI


class GreedyPacman(BasePacmanAI):
    """Greedy algorithm - moves towards nearest pellet, avoids ghosts when close"""
    
    GHOST_DANGER_DISTANCE = 3  # Distance threshold to consider ghost dangerous
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Move towards nearest pellet while avoiding close ghosts
        
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
        
        # If no pellets, just move randomly
        if not pellet_positions:
            return neighbors[0]
        
        # Find nearest pellet
        nearest_pellet = min(pellet_positions, key=lambda p: self.distance(pacman_pos, p))
        
        # Score each neighbor
        best_move = neighbors[0]
        best_score = float('-inf')
        
        for neighbor in neighbors:
            score = 0
            
            # Prefer moves towards nearest pellet
            dist_to_pellet = self.distance(neighbor, nearest_pellet)
            score -= dist_to_pellet * 10
            
            # Avoid ghosts
            for ghost_pos in ghost_positions:
                ghost_dist = self.distance(neighbor, ghost_pos)
                if ghost_dist < self.GHOST_DANGER_DISTANCE:
                    # Heavy penalty for being close to ghosts
                    score -= (self.GHOST_DANGER_DISTANCE - ghost_dist) * 50
            
            if score > best_score:
                best_score = score
                best_move = neighbor
        
        return best_move
