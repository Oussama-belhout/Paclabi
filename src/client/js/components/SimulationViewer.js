/**
 * Simulation Viewer - Replay recorded games with ghost AI
 */

class SimulationViewer {
  constructor(canvasId, grid, trajectory, ghostConfigs, botMode = false, botAlgorithm = null) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }
    
    if (!grid || !Array.isArray(grid) || grid.length === 0) {
      throw new Error('Invalid grid provided to SimulationViewer');
    }
    
    if (!trajectory || !Array.isArray(trajectory) || trajectory.length === 0) {
      throw new Error('Invalid trajectory provided to SimulationViewer');
    }

    this.mazeCanvas = new MazeCanvas(canvasId, grid);
    this.grid = grid;
    this.trajectory = trajectory;
    this.ghostConfigs = ghostConfigs;
    this.botMode = botMode;
    this.botAlgorithm = botAlgorithm;
    
    this.currentFrame = 0;
    this.isPlaying = false;
    this.animationFrameId = null;
    this.fps = 10; // Frames per second
    
    // Current Pacman position
    this.currentPacmanPos = trajectory[0].position || trajectory[0];
    
    // Ghost positions (will be calculated)
    this.ghostPositions = this.initializeGhosts();
    
    // Pellets tracking for bot mode
    this.remainingPellets = this.countPellets();
    this.maxFrames = 1000; // Maximum frames for bot simulation
    
    // Simulation results
    this.simulationStartTime = Date.now();
    this.caughtFrame = null;
    this.caughtTime = null;
    this.caughtByGhost = null;
    this.allFrames = []; // Store all frames for saving
    
    // Initial render
    console.log('SimulationViewer initialized with grid:', grid.length, 'x', grid[0]?.length);
    console.log('Bot mode:', botMode, '| Algorithm:', botAlgorithm);
    this.render();
  }

  initializeGhosts() {
    return this.ghostConfigs.map((config, index) => ({
      type: config.type || ['blinky', 'pinky', 'inky', 'clyde'][index],
      position: config.startPos || { y: 1 + index, x: 1 + index * 2 },
      lastMove: Date.now()
    }));
  }

  countPellets() {
    let count = 0;
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x] === 3 || this.grid[y][x] === 4) { // 3 = pellet, 4 = power pellet
          count++;
        }
      }
    }
    return count;
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

    // Check max frames limit for bot mode
    if (this.botMode && this.currentFrame >= this.maxFrames) {
      this.pause();
      Formatters.showToast('Simulation timeout - max frames reached', 'warning');
      if (this.onSimulationComplete) {
        this.onSimulationComplete(this.getResults());
      }
      return;
    }

    let pacmanPos;
    
    if (this.botMode) {
      // Bot mode: generate next move dynamically
      pacmanPos = this.generateBotMove();
      
      if (!pacmanPos) {
        // No valid move found
        this.pause();
        Formatters.showToast('Bot stuck - no valid moves!', 'warning');
        if (this.onSimulationComplete) {
          this.onSimulationComplete(this.getResults());
        }
        return;
      }
      
      // Check if Pacman collected a pellet
      if (this.grid[pacmanPos.y][pacmanPos.x] === 3 || this.grid[pacmanPos.y][pacmanPos.x] === 4) {
        this.grid[pacmanPos.y][pacmanPos.x] = 0; // Remove pellet
        this.remainingPellets--;
      }
      
      // Check win condition
      if (this.remainingPellets <= 0) {
        this.pause();
        Formatters.showToast('Bot won! All pellets collected!', 'success');
        if (this.onSimulationComplete) {
          this.onSimulationComplete(this.getResults());
        }
        return;
      }
      
      this.currentPacmanPos = pacmanPos;
    } else {
      // Normal mode: read from trajectory
      const move = this.trajectory[this.currentFrame];
      if (!move || !move.position) {
        // End of trajectory - Pacman escaped!
        this.pause();
        Formatters.showToast('Replay finished! Pacman escaped!', 'success');
        
        // Trigger save prompt
        if (this.onSimulationComplete) {
          this.onSimulationComplete(this.getResults());
        }
        return;
      }
      pacmanPos = move.position;
    }

    // Update ghost positions
    this.updateGhostPositions(pacmanPos);

    // Render frame
    this.render();

    // Record frame
    this.recordFrame(pacmanPos);

    // Check collision
    const caughtInfo = this.checkCollision(pacmanPos);
    if (caughtInfo.caught) {
      this.pause();
      this.caughtFrame = this.currentFrame;
      this.caughtTime = this.currentFrame * (1000 / this.fps);
      this.caughtByGhost = caughtInfo.ghostType;
      
      Formatters.showToast(`Pacman caught by ${caughtInfo.ghostType.toUpperCase()}!`, 'error');
      
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

  generateBotMove() {
    // Get valid neighbors
    const neighbors = this.getValidNeighbors(this.currentPacmanPos);
    if (neighbors.length === 0) return null;
    
    // Simple algorithm implementations
    switch (this.botAlgorithm) {
      case 'greedy':
        return this.greedyMove(neighbors);
      case 'defensive':
        return this.defensiveMove(neighbors);
      case 'aggressive':
        return this.aggressiveMove(neighbors);
      case 'random':
      default:
        return this.randomMove(neighbors);
    }
  }

  getValidNeighbors(pos) {
    const neighbors = [];
    const directions = [
      { y: -1, x: 0 }, // UP
      { y: 1, x: 0 },  // DOWN
      { y: 0, x: -1 }, // LEFT
      { y: 0, x: 1 }   // RIGHT
    ];
    
    for (const dir of directions) {
      const newPos = { y: pos.y + dir.y, x: pos.x + dir.x };
      if (this.isWalkable(newPos)) {
        neighbors.push(newPos);
      }
    }
    
    return neighbors;
  }

  greedyMove(neighbors) {
    // Move towards nearest pellet, avoid ghosts
    let bestMove = neighbors[0];
    let bestScore = -Infinity;
    
    for (const neighbor of neighbors) {
      let score = 0;
      
      // Find nearest pellet
      let minPelletDist = Infinity;
      for (let y = 0; y < this.grid.length; y++) {
        for (let x = 0; x < this.grid[y].length; x++) {
          if (this.grid[y][x] === 3 || this.grid[y][x] === 4) {
            const dist = Math.abs(neighbor.y - y) + Math.abs(neighbor.x - x);
            minPelletDist = Math.min(minPelletDist, dist);
          }
        }
      }
      score -= minPelletDist * 10;
      
      // Avoid ghosts
      for (const ghost of this.ghostPositions) {
        const ghostDist = Math.abs(neighbor.y - ghost.position.y) + Math.abs(neighbor.x - ghost.position.x);
        if (ghostDist < 3) {
          score -= (3 - ghostDist) * 50;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = neighbor;
      }
    }
    
    return bestMove;
  }

  defensiveMove(neighbors) {
    // Maximize distance from ghosts
    let bestMove = neighbors[0];
    let maxMinGhostDist = -1;
    
    for (const neighbor of neighbors) {
      let minGhostDist = Infinity;
      for (const ghost of this.ghostPositions) {
        const dist = Math.abs(neighbor.y - ghost.position.y) + Math.abs(neighbor.x - ghost.position.x);
        minGhostDist = Math.min(minGhostDist, dist);
      }
      
      if (minGhostDist > maxMinGhostDist) {
        maxMinGhostDist = minGhostDist;
        bestMove = neighbor;
      }
    }
    
    return bestMove;
  }

  aggressiveMove(neighbors) {
    // Move towards pellets, only avoid very close ghosts
    let bestMove = neighbors[0];
    let bestScore = -Infinity;
    
    for (const neighbor of neighbors) {
      let score = 0;
      
      // Strongly prefer pellets
      let minPelletDist = Infinity;
      for (let y = 0; y < this.grid.length; y++) {
        for (let x = 0; x < this.grid[y].length; x++) {
          if (this.grid[y][x] === 3 || this.grid[y][x] === 4) {
            const dist = Math.abs(neighbor.y - y) + Math.abs(neighbor.x - x);
            minPelletDist = Math.min(minPelletDist, dist);
          }
        }
      }
      score -= minPelletDist * 100;
      
      // Only avoid very close ghosts
      for (const ghost of this.ghostPositions) {
        const ghostDist = Math.abs(neighbor.y - ghost.position.y) + Math.abs(neighbor.x - ghost.position.x);
        if (ghostDist <= 1) {
          score -= 1000;
        } else if (ghostDist === 2) {
          score -= 50;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = neighbor;
      }
    }
    
    return bestMove;
  }

  randomMove(neighbors) {
    // Filter out positions too close to ghosts
    const safeNeighbors = neighbors.filter(neighbor => {
      for (const ghost of this.ghostPositions) {
        const dist = Math.abs(neighbor.y - ghost.position.y) + Math.abs(neighbor.x - ghost.position.x);
        if (dist <= 2) return false;
      }
      return true;
    });
    
    // If no safe neighbors, use any neighbor
    const options = safeNeighbors.length > 0 ? safeNeighbors : neighbors;
    return options[Math.floor(Math.random() * options.length)];
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
    // Return results without frames to avoid serialization issues
    // Frames are optional and can be very large
    return {
      caught: this.caughtFrame !== null,
      catchPosition: this.caughtFrame !== null ? this.trajectory[this.caughtFrame].position : null,
      catchTime: this.caughtTime,
      caughtByGhost: this.caughtByGhost,
      totalFrames: this.allFrames.length
      // frames: [] - intentionally omitted to avoid data corruption issues
    };
  }

  render() {
    // Render maze (this should always work)
    if (this.mazeCanvas && this.mazeCanvas.render) {
      this.mazeCanvas.render();
    }

    // Get current Pacman position
    let pacmanPos, direction;
    
    if (this.botMode) {
      // Bot mode: use current position
      pacmanPos = this.currentPacmanPos;
      direction = 'RIGHT';
    } else {
      // Normal mode: read from trajectory
      const move = this.trajectory[this.currentFrame];
      if (move && move.position) {
        pacmanPos = move.position;
        direction = move.direction || 'RIGHT';
      }
    }
    
    if (pacmanPos) {
      // Draw Pacman
      if (this.mazeCanvas && this.mazeCanvas.drawPacman) {
        this.mazeCanvas.drawPacman(pacmanPos.y, pacmanPos.x, direction);
      }
    }

    // Draw ghosts
    if (this.ghostPositions && Array.isArray(this.ghostPositions)) {
      this.ghostPositions.forEach(ghost => {
        if (ghost.position && this.mazeCanvas && this.mazeCanvas.drawGhost) {
          this.mazeCanvas.drawGhost(ghost.position.y, ghost.position.x, ghost.type);
        }
      });
    }
  }

  getProgress() {
    if (this.botMode) {
      // In bot mode, show progress based on frames or pellets
      if (this.maxFrames > 0) {
        return (this.currentFrame / this.maxFrames) * 100;
      }
      return 0;
    }
    return (this.currentFrame / this.trajectory.length) * 100;
  }

  seekTo(frame) {
    this.currentFrame = Math.max(0, Math.min(frame, this.trajectory.length - 1));
    
    // Reset ghosts for this frame (simplified)
    this.ghostPositions = this.initializeGhosts();
    
    this.render();
  }
}

