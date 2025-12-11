/**
 * Game Engine - Main game loop and trajectory recording
 */

class GameEngine {
  constructor(canvasId, grid, mazeId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    // Deep copy the grid so we can modify it (remove pellets)
    this.grid = JSON.parse(JSON.stringify(grid));
    this.mazeCanvas = new MazeCanvas(canvasId, this.grid);
    this.originalGrid = JSON.parse(JSON.stringify(grid)); // Keep original for reference
    this.mazeId = mazeId;
    
    // Find starting position (first walkable cell)
    const start = this.findStartPosition();
    this.pacman = new PacmanController(this.grid, start.y, start.x);
    
    this.inputHandler = new InputHandler((dir) => {
      this.pacman.direction = dir;
    });

    this.trajectory = [];
    this.startTime = null;
    this.isRunning = false;
    this.isPaused = false;
    this.animationFrameId = null;
    
    this.totalPellets = this.countPellets();
  }

  findStartPosition() {
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x] !== 1) {
          return { y, x };
        }
      }
    }
    return { y: 1, x: 1 };
  }

  countPellets() {
    let count = 0;
    for (let row of this.grid) {
      for (let cell of row) {
        if (cell === 2 || cell === 3) {
          count++;
        }
      }
    }
    return count;
  }

  start() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.pausedTime = 0; // Track total paused time
    this.pauseStartTime = null;
    this.gameLoop();
  }

  pause() {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // Starting pause - record when
      this.pauseStartTime = Date.now();
    } else {
      // Ending pause - add to total paused time
      if (this.pauseStartTime) {
        this.pausedTime += Date.now() - this.pauseStartTime;
        this.pauseStartTime = null;
      }
    }
    
    return this.isPaused; // Return current state
  }
  
  togglePause() {
    return this.pause();
  }
  
  getElapsedTime() {
    if (!this.startTime) return 0;
    
    let elapsed = Date.now() - this.startTime - this.pausedTime;
    
    // If currently paused, don't count the current pause time
    if (this.isPaused && this.pauseStartTime) {
      elapsed -= (Date.now() - this.pauseStartTime);
    }
    
    return elapsed;
  }

  gameLoop() {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      // Try to move Pacman
      const queued = this.inputHandler.getQueuedDirection();
      if (queued && this.pacman.canMove(queued)) {
        this.pacman.move(queued);
        this.recordMove();
      } else if (this.pacman.canMove(this.pacman.direction)) {
        this.pacman.move(this.pacman.direction);
        this.recordMove();
      }

      // Check win condition
      if (this.pacman.getPelletsEaten() >= this.totalPellets) {
        this.stop();
        Formatters.showToast('All pellets collected!', 'success');
        return;
      }
    }

    // Always render, even when paused (so we can see the current state)
    this.render();

    this.animationFrameId = requestAnimationFrame(() => {
      setTimeout(() => this.gameLoop(), 150); // 150ms per move
    });
  }

  recordMove() {
    const timestamp = Date.now() - this.startTime;
    this.trajectory.push({
      position: this.pacman.getPosition(),
      direction: this.pacman.getDirection(),
      timestamp,
      pelletsEaten: this.pacman.getPelletsEaten()
    });
  }

  render() {
    // Update the maze canvas grid to reflect eaten pellets
    this.mazeCanvas.updateGrid(this.grid);
    
    const pos = this.pacman.getPosition();
    this.mazeCanvas.drawPacman(pos.y, pos.x, this.pacman.getDirection());
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  async saveTrajectory(name) {
    if (this.trajectory.length === 0) {
      throw new Error('No trajectory to save');
    }

    const data = {
      name,
      mazeId: this.mazeId,
      moves: this.trajectory,
      duration: Date.now() - this.startTime,
      pelletsCollected: this.pacman.getPelletsEaten(),
      totalPellets: this.totalPellets
    };

    return await GameAPI.saveTrajectory(data);
  }

  getTrajectory() {
    return this.trajectory;
  }
}

