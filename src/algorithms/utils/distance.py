"""Distance calculation utilities."""

def manhattan_distance(pos1, pos2):
    """
    Calculate Manhattan distance between two positions.
    
    Args:
        pos1: Tuple (x, y) or dict with 'x', 'y' keys
        pos2: Tuple (x, y) or dict with 'x', 'y' keys
    
    Returns:
        int: Manhattan distance
    """
    if isinstance(pos1, dict):
        x1, y1 = pos1['x'], pos1['y']
    else:
        x1, y1 = pos1
    
    if isinstance(pos2, dict):
        x2, y2 = pos2['x'], pos2['y']
    else:
        x2, y2 = pos2
    
    return abs(x1 - x2) + abs(y1 - y2)


def euclidean_distance(pos1, pos2):
    """
    Calculate Euclidean distance between two positions.
    
    Args:
        pos1: Tuple (x, y) or dict with 'x', 'y' keys
        pos2: Tuple (x, y) or dict with 'x', 'y' keys
    
    Returns:
        float: Euclidean distance
    """
    if isinstance(pos1, dict):
        x1, y1 = pos1['x'], pos1['y']
    else:
        x1, y1 = pos1
    
    if isinstance(pos2, dict):
        x2, y2 = pos2['x'], pos2['y']
    else:
        x2, y2 = pos2
    
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5


def chebyshev_distance(pos1, pos2):
    """
    Calculate Chebyshev distance (chessboard distance) between two positions.
    
    Args:
        pos1: Tuple (x, y) or dict with 'x', 'y' keys
        pos2: Tuple (x, y) or dict with 'x', 'y' keys
    
    Returns:
        int: Chebyshev distance
    """
    if isinstance(pos1, dict):
        x1, y1 = pos1['x'], pos1['y']
    else:
        x1, y1 = pos1
    
    if isinstance(pos2, dict):
        x2, y2 = pos2['x'], pos2['y']
    else:
        x2, y2 = pos2
    
    return max(abs(x1 - x2), abs(y1 - y2))

