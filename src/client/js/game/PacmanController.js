/**
 * Pacman Controller - Handles Pacman movement and state
 */

class PacmanController {
  constructor(grid, startY = 1, startX = 1) {
    this.grid = grid;
    this.position = { y: startY, x: startX };
    this.direction = 'RIGHT';
    this.pelletsEaten = 0;
  }

  canMove(direction) {
    const newPos = this.getNextPosition(direction);
    
    if (newPos.y < 0 || newPos.y >= this.grid.length ||
        newPos.x < 0 || newPos.x >= this.grid[0].length) {
      return false;
    }

    return this.grid[newPos.y][newPos.x] !== 1; // Not a wall
  }

  getNextPosition(direction) {
    const newPos = { ...this.position };

    switch (direction) {
      case 'UP':
        newPos.y--;
        break;
      case 'DOWN':
        newPos.y++;
        break;
      case 'LEFT':
        newPos.x--;
        break;
      case 'RIGHT':
        newPos.x++;
        break;
    }

    return newPos;
  }

  move(direction) {
    if (!this.canMove(direction)) {
      return false;
    }

    this.direction = direction;
    this.position = this.getNextPosition(direction);

    // Check for pellet
    const cellValue = this.grid[this.position.y][this.position.x];
    if (cellValue === 2 || cellValue === 3) {
      this.pelletsEaten++;
      this.grid[this.position.y][this.position.x] = 0; // Remove pellet
    }

    return true;
  }

  getPosition() {
    return { ...this.position };
  }

  getDirection() {
    return this.direction;
  }

  getPelletsEaten() {
    return this.pelletsEaten;
  }
}

