/**
 * Maze Canvas Renderer
 */

class MazeCanvas {
  constructor(canvasId, grid) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    this.ctx = this.canvas.getContext('2d');
    this.grid = grid;
    this.cellSize = 0;
    
    this.colors = {
      wall: '#171c85',
      path: '#040404',
      pellet: '#ffd54f',
      powerPellet: '#ffeb3b',
      pacman: '#ffeb3b',
      ghost: {
        blinky: '#ff1744',
        pinky: '#f50057',
        inky: '#00e5ff',
        clyde: '#ff9100'
      }
    };
  }

  render() {
    if (!this.grid || this.grid.length === 0) {
      return;
    }

    const rows = this.grid.length;
    const cols = this.grid[0].length;

    // Calculate optimal cell size
    const maxWidth = 800;
    const maxHeight = 600;
    this.cellSize = Math.floor(Math.min(maxWidth / cols, maxHeight / rows));
    this.cellSize = Math.max(this.cellSize, 4);

    // Set canvas dimensions
    this.canvas.width = cols * this.cellSize;
    this.canvas.height = rows * this.cellSize;

    // Draw grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellValue = this.grid[row][col];
        this.drawCell(row, col, cellValue);
      }
    }
  }

  drawCell(row, col, value) {
    const x = col * this.cellSize;
    const y = row * this.cellSize;

    // Draw base cell
    if (value === 1) {
      // Wall - Pac-Man style with glowing borders
      this.ctx.fillStyle = this.colors.path; // Fill with path color (hollow inside)
      this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
      
      // Draw glowing border
      this.drawWallBorders(row, col, x, y);
    } else {
      // Path
      this.ctx.fillStyle = this.colors.path;
      this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

      // Draw pellet if present
      if (value === 2) {
        this.drawPellet(x + this.cellSize / 2, y + this.cellSize / 2, false);
      } else if (value === 3) {
        this.drawPellet(x + this.cellSize / 2, y + this.cellSize / 2, true);
      }
    }
  }

  drawWallBorders(row, col, x, y) {
    const borderWidth = Math.max(2, this.cellSize * 0.15);
    const rows = this.grid.length;
    const cols = this.grid[0].length;
    
    // Create gradient for glow effect
    this.ctx.strokeStyle = '#2E3FFF';
    this.ctx.lineWidth = borderWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Add glow effect
    this.ctx.shadowColor = '#4A5FFF';
    this.ctx.shadowBlur = borderWidth * 1.5;
    
    this.ctx.beginPath();
    
    // Check adjacent cells and draw borders accordingly
    const isWall = (r, c) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
      return this.grid[r][c] === 1;
    };
    
    const offset = borderWidth / 2;
    
    // Top border
    if (!isWall(row - 1, col)) {
      this.ctx.moveTo(x + offset, y + offset);
      this.ctx.lineTo(x + this.cellSize - offset, y + offset);
    }
    
    // Right border
    if (!isWall(row, col + 1)) {
      this.ctx.moveTo(x + this.cellSize - offset, y + offset);
      this.ctx.lineTo(x + this.cellSize - offset, y + this.cellSize - offset);
    }
    
    // Bottom border
    if (!isWall(row + 1, col)) {
      this.ctx.moveTo(x + this.cellSize - offset, y + this.cellSize - offset);
      this.ctx.lineTo(x + offset, y + this.cellSize - offset);
    }
    
    // Left border
    if (!isWall(row, col - 1)) {
      this.ctx.moveTo(x + offset, y + this.cellSize - offset);
      this.ctx.lineTo(x + offset, y + offset);
    }
    
    this.ctx.stroke();
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
  }

  drawPellet(x, y, isPower) {
    this.ctx.fillStyle = isPower ? this.colors.powerPellet : this.colors.pellet;
    const radius = isPower ? this.cellSize * 0.3 : this.cellSize * 0.15;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawPacman(row, col, direction = 'RIGHT') {
    const x = col * this.cellSize + this.cellSize / 2;
    const y = row * this.cellSize + this.cellSize / 2;
    const radius = this.cellSize * 0.4;

    // Mouth angles based on direction
    const angles = {
      'RIGHT': [0.2, 1.8],
      'LEFT': [1.2, 0.8],
      'UP': [1.7, 1.3],
      'DOWN': [0.7, 0.3]
    };

    const [startAngle, endAngle] = angles[direction] || angles['RIGHT'];

    this.ctx.fillStyle = this.colors.pacman;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, startAngle * Math.PI, endAngle * Math.PI);
    this.ctx.lineTo(x, y);
    this.ctx.fill();
  }

  drawGhost(row, col, type = 'blinky') {
    const x = col * this.cellSize + this.cellSize / 2;
    const y = row * this.cellSize + this.cellSize / 2;
    const radius = this.cellSize * 0.4;

    this.ctx.fillStyle = this.colors.ghost[type] || this.colors.ghost.blinky;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw eyes
    this.ctx.fillStyle = 'white';
    const eyeRadius = radius * 0.25;
    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.3, y - radius * 0.2, eyeRadius, 0, Math.PI * 2);
    this.ctx.arc(x + radius * 0.3, y - radius * 0.2, eyeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.3, y - radius * 0.2, eyeRadius * 0.5, 0, Math.PI * 2);
    this.ctx.arc(x + radius * 0.3, y - radius * 0.2, eyeRadius * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateGrid(grid) {
    this.grid = grid;
    this.render();
  }
}

