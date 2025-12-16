"""
Defensive Pacman - Prioritizes staying away from ghosts
"""

from .base_pacman import BasePacmanAI


class DefensivePacman(BasePacmanAI):
    """Defensive algorithm - prioritizes safety over pellet collection"""
    
    def get_next_move(self, pacman_pos, ghost_positions, pellet_positions):
        """
        Move away from ghosts, only collect pellets when safe
        
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
        
        # Find move that maximizes distance from nearest ghost
        best_move = neighbors[0]
        best_score = float('-inf')
        
        for neighbor in neighbors:
            score = 0
            
            # Calculate minimum distance to any ghost
            if ghost_positions:
                min_ghost_dist = min(self.distance(neighbor, g) for g in ghost_positions)
                # Prefer positions far from ghosts
                score += min_ghost_dist * 100
            
            # Secondary: prefer positions near pellets (but only if safe)
            if pellet_positions and ghost_positions:
                min_ghost_dist = min(self.distance(neighbor, g) for g in ghost_positions)
                if min_ghost_dist > 5:  # Only consider pellets if ghosts are far
                    nearest_pellet_dist = min(self.distance(neighbor, p) for p in pellet_positions)
                    score -= nearest_pellet_dist * 5
            
            if score > best_score:
                best_score = score
                best_move = neighbor
        
        return best_move
