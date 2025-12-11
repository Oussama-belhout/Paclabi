"""Maze format conversion utilities."""

def internal_to_grid(maze, width, height, tunnels_h=None, tunnels_v=None):
    """
    Convert internal maze representation to a visual grid.
    
    Internal format: List of lists representing walls between cells
    Grid format: 2D array where 0=path, 1=wall
    
    Args:
        maze: Internal maze representation
        width: Maze width in cells
        height: Maze height in cells
        tunnels_h: Set of rows with horizontal tunnels
        tunnels_v: Set of columns with vertical tunnels
    
    Returns:
        list: 2D grid array
    """
    if tunnels_h is None:
        tunnels_h = set()
    if tunnels_v is None:
        tunnels_v = set()
    
    # Grid dimensions: 2*height+1 x 2*width+1
    rows = 2 * height + 1
    cols = 2 * width + 1
    grid = [[1 for _ in range(cols)] for _ in range(rows)]
    
    # Mark cells as paths
    for y in range(height):
        for x in range(width):
            cell_row = 2 * y + 1
            cell_col = 2 * x + 1
            grid[cell_row][cell_col] = 0
            
            # Check horizontal walls
            if x < width - 1 and maze[2 * y][x] is False:
                grid[cell_row][cell_col + 1] = 0
            
            # Check vertical walls
            if y < height - 1 and maze[2 * y + 1][x] is False:
                grid[cell_row + 1][cell_col] = 0
    
    # Apply horizontal tunnels (open left and right borders)
    for y in tunnels_h:
        if 0 <= y < height:
            row = 2 * y + 1
            grid[row][0] = 0  # Left border
            grid[row][cols - 1] = 0  # Right border
    
    # Apply vertical tunnels (open top and bottom borders)
    for x in tunnels_v:
        if 0 <= x < width:
            col = 2 * x + 1
            grid[0][col] = 0  # Top border
            grid[rows - 1][col] = 0  # Bottom border
    
    return grid


def grid_to_playable(grid):
    """
    Convert grid to a playable format with cell types.
    
    Args:
        grid: 2D array where 0=path, 1=wall
    
    Returns:
        list: 2D array with cell types (0=path, 1=wall, 2=pellet, etc.)
    """
    # For now, just return a copy
    # Pellets will be added by pellet placement algorithms
    return [row[:] for row in grid]


def get_walkable_cells(grid):
    """
    Get all walkable cell positions from a grid.
    
    Args:
        grid: 2D array where 0=path, 1=wall
    
    Returns:
        list: List of (row, col) tuples for walkable cells
    """
    walkable = []
    for row in range(len(grid)):
        for col in range(len(grid[0])):
            if grid[row][col] == 0:
                walkable.append((row, col))
    return walkable

