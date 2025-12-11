/**
 * Simulation Viewer - Replay recorded games with ghost AI
 */

class SimulationViewer {
  constructor(canvasId, grid, trajectory, ghostConfigs) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    this.mazeCanvas = new MazeCanvas(canvasId, grid);
    this.grid = grid;
    this.trajectory = trajectory;
    this.ghostConfigs = ghostConfigs;
    
    this.currentFrame = 0;
    this.isPlaying = false;
    this.animationFrameId = null;
    this.fps = 10; // Frames per second
    
    // Ghost positions (will be calculated)
    this.ghostPositions = this.initializeGhosts();
    
    // Simulation results
    this.simulationStartTime = Date.now();
    this.caughtFrame = null;
    this.caughtTime = null;
    this.caughtByGhost = null;
    this.allFrames = []; // Store all frames for saving
  }

  initializeGhosts() {
    return this.ghostConfigs.map((config, index) => ({
      type: config.type || ['blinky', 'pinky', 'inky', 'clyde'][index],
      position: config.startPos || { y: 1 + index, x: 1 + index * 2 },
      lastMove: Date.now()
    }));
  }

  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.animate();
  }

  pause() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  reset() {
    this.pause();
    this.currentFrame = 0;
    this.ghostPositions = this.initializeGhosts();
    this.render();
  }

  animate() {
    if (!this.isPlaying) return;

    const move = this.trajectory[this.currentFrame];
    
    if (!move) {
      // End of trajectory
      this.pause();
      Formatters.showToast('🎬 Replay finished! Pacman escaped!', 'success');
      return;
    }

    // Update ghost positions (simple chase logic for demo)
    this.updateGhostPositions(move.position);

    // Render frame
    this.render();

    // Record frame
    this.recordFrame(move.position);

    // Check collision
    const caughtInfo = this.checkCollision(move.position);
    if (caughtInfo.caught) {
      this.pause();
      this.caughtFrame = this.currentFrame;
      this.caughtTime = move.timestamp || (this.currentFrame * 100);
      this.caughtByGhost = caughtInfo.ghostType;
      
      Formatters.showToast(`👻 Pacman caught by ${caughtInfo.ghostType.toUpperCase()}!`, 'error');
      
      // Trigger save prompt
      if (this.onSimulationComplete) {
        this.onSimulationComplete(this.getResults());
      }
      return;
    }

    // Move to next frame
    this.currentFrame++;

    // Schedule next frame
    this.animationFrameId = setTimeout(() => {
      requestAnimationFrame(() => this.animate());
    }, 1000 / this.fps);
  }

  updateGhostPositions(pacmanPos) {
    // Simple AI: each ghost moves towards Pacman
    this.ghostPositions.forEach(ghost => {
      const dx = pacmanPos.x - ghost.position.x;
      const dy = pacmanPos.y - ghost.position.y;

      // Move one step towards Pacman
      let newPos = { ...ghost.position };

      if (Math.abs(dx) > Math.abs(dy)) {
        // Move horizontally
        newPos.x += dx > 0 ? 1 : -1;
      } else if (dy !== 0) {
        // Move vertically
        newPos.y += dy > 0 ? 1 : -1;
      }

      // Check if move is valid
      if (this.isWalkable(newPos)) {
        ghost.position = newPos;
      }
    });
  }

  isWalkable(pos) {
    if (pos.y < 0 || pos.y >= this.grid.length ||
        pos.x < 0 || pos.x >= this.grid[0].length) {
      return false;
    }
    return this.grid[pos.y][pos.x] !== 1; // Not a wall
  }

  checkCollision(pacmanPos) {
    for (let ghost of this.ghostPositions) {
      if (ghost.position.x === pacmanPos.x && ghost.position.y === pacmanPos.y) {
        return { caught: true, ghostType: ghost.type };
      }
    }
    return { caught: false };
  }
  
  recordFrame(pacmanPos) {
    this.allFrames.push({
      timestamp: this.trajectory[this.currentFrame]?.timestamp || (this.currentFrame * 100),
      pacman: { x: pacmanPos.x, y: pacmanPos.y },
      ghosts: this.ghostPositions.map(g => ({
        type: g.type,
        position: { x: g.position.x, y: g.position.y }
      })),
      caught: false
    });
  }
  
  getResults() {
    return {
      caught: this.caughtFrame !== null,
      catchPosition: this.caughtFrame !== null ? this.trajectory[this.caughtFrame].position : null,
      catchTime: this.caughtTime,
      caughtByGhost: this.caughtByGhost,
      totalFrames: this.allFrames.length,
      frames: this.allFrames
    };
  }

  render() {
    // Render maze
    this.mazeCanvas.render();

    // Get current Pacman position
    const move = this.trajectory[this.currentFrame];
    if (move) {
      // Draw Pacman
      this.mazeCanvas.drawPacman(move.position.y, move.position.x, move.direction);
    }

    // Draw ghosts
    this.ghostPositions.forEach(ghost => {
      this.mazeCanvas.drawGhost(ghost.position.y, ghost.position.x, ghost.type);
    });
  }

  getProgress() {
    return (this.currentFrame / this.trajectory.length) * 100;
  }

  seekTo(frame) {
    this.currentFrame = Math.max(0, Math.min(frame, this.trajectory.length - 1));
    
    // Reset ghosts for this frame (simplified)
    this.ghostPositions = this.initializeGhosts();
    
    this.render();
  }
}

