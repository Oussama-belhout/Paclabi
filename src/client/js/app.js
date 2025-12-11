/**
 * Main Application - Pacman Lab
 */

class PacmanLabApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.currentMaze = null;
    this.currentTrajectory = null;
    this.gameEngine = null;
    this.lastRecordedTrajectory = null; // Store last played trajectory
    this.simulationViewer = null;
    
    this.init();
  }

  init() {
    this.setupNavigation();
    this.loadPage('dashboard');
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        
        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        this.loadPage(page);
      });
    });
  }

  async loadPage(page) {
    this.currentPage = page;
    const container = document.getElementById('app-container');

    switch (page) {
      case 'dashboard':
        await this.renderDashboard(container);
        break;
      case 'generator':
        await this.renderGenerator(container);
        break;
      case 'player':
        await this.renderPlayer(container);
        break;
      case 'simulation':
        await this.renderSimulation(container);
        break;
    }
  }

  async renderDashboard(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Dashboard</h2>
          <p>Recent Mazes & Trajectories</p>
        </div>
        
        <div class="grid grid-2">
          <div id="recent-mazes-section">
            <h3>Recent Mazes</h3>
            <div id="recent-mazes-list"></div>
          </div>
          
          <div id="recent-trajectories-section">
            <h3>Recent Trajectories</h3>
            <div id="recent-trajectories-list"></div>
          </div>
        </div>
      </div>
    `;

    try {
      Formatters.showLoading(true);
      
      // Load recent mazes and trajectories
      const [mazesData, trajectoriesData] = await Promise.all([
        MazeAPI.getAllMazes(1, 10),
        GameAPI.getAllTrajectories(1, 10)
      ]);

      this.displayMazeList(mazesData.mazes, 'recent-mazes-list');
      this.displayTrajectoryList(trajectoriesData.trajectories, 'recent-trajectories-list');
      
      Formatters.showLoading(false);
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading dashboard: ${error.message}`, 'error');
    }
  }

  async renderGenerator(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Maze Generator</h2>
          <p>Create a new maze with custom configurations</p>
        </div>
        
        ${ConfigPanel.createMazeConfig()}
        
        <div class="action-buttons">
          <button class="btn btn-primary" id="generate-maze-btn">Generate Maze</button>
        </div>
      </div>
      
      <div class="card" id="generated-maze-section" style="display: none; margin-top: 24px;">
        <div class="card-header">
          <h2>Generated Maze</h2>
          <p>Rate and save your maze</p>
        </div>
        
        <div class="maze-canvas-container">
          <canvas id="maze-canvas"></canvas>
        </div>
        
        <div class="action-buttons">
          <h3>Rate This Maze:</h3>
          <div id="maze-rating"></div>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-secondary" id="regenerate-btn">Generate Another</button>
          <button class="btn btn-primary" id="save-maze-btn">Save Maze</button>
        </div>
      </div>
      
      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h2>Saved Mazes</h2>
          <p>Browse and manage your mazes</p>
        </div>
        <div id="saved-mazes-list"></div>
      </div>
    `;

    // Load saved mazes
    this.loadSavedMazes();

    // Setup event listeners
    document.getElementById('generate-maze-btn').addEventListener('click', () => this.generateMaze());
  }

  async generateMaze() {
    try {
      const config = ConfigPanel.getMazeConfigValues();
      const errors = Validators.validateMazeConfig(config);

      if (errors.length > 0) {
        Formatters.showToast(errors.join(', '), 'error');
        return;
      }

      Formatters.showLoading(true);
      
      const result = await MazeAPI.generateMaze(config);
      this.currentMaze = result.maze;

      // Render maze
      const mazeCanvas = new MazeCanvas('maze-canvas', this.currentMaze.grid);
      mazeCanvas.render();

      // Show maze section
      document.getElementById('generated-maze-section').style.display = 'block';

      // Setup rating
      const ratingComponent = new StarRating('maze-rating', 0);

      // Setup save button
      document.getElementById('save-maze-btn').onclick = async () => {
        const rating = ratingComponent.getRating();
        if (rating > 0) {
          await MazeAPI.updateRating(this.currentMaze._id, rating);
        }
        Formatters.showToast('Maze saved successfully!', 'success');
        this.loadSavedMazes();
      };

      document.getElementById('regenerate-btn').onclick = () => {
        document.getElementById('generated-maze-section').style.display = 'none';
        this.generateMaze();
      };

      Formatters.showLoading(false);
      Formatters.showToast('Maze generated successfully!', 'success');
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error generating maze: ${error.message}`, 'error');
    }
  }

  async loadSavedMazes() {
    try {
      const data = await MazeAPI.getAllMazes(1, 20);
      this.displayMazeList(data.mazes, 'saved-mazes-list', true);
    } catch (error) {
      console.error('Error loading saved mazes:', error);
    }
  }

  displayMazeList(mazes, containerId, withActions = false) {
    const container = document.getElementById(containerId);
    
    if (mazes.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No mazes found</p></div>';
      return;
    }

    container.innerHTML = `<div class="maze-list"></div>`;
    const listEl = container.querySelector('.maze-list');

    mazes.forEach(maze => {
      const item = document.createElement('div');
      item.className = 'maze-item';
      item.style.cursor = 'pointer';
      
      // Make the whole card clickable to view maze
      item.onclick = (e) => {
        // Don't trigger if clicking on action buttons
        if (!e.target.closest('.btn')) {
          this.viewMaze(maze._id);
        }
      };
      
      item.innerHTML = `
        <h3>${maze.name}</h3>
        <div class="maze-item-details">
          <p><strong>Size:</strong> ${maze.config.width}×${maze.config.height}</p>
          <p><strong>Algorithm:</strong> ${Formatters.formatAlgorithmName(maze.config.algorithm)}</p>
          ${maze.rating.user ? `<p><strong>Rating:</strong> ${'⭐'.repeat(maze.rating.user)}</p>` : ''}
          <p><strong>Created:</strong> ${Formatters.formatDate(maze.createdAt)}</p>
        </div>
        ${withActions ? `
          <div class="action-buttons">
            <button class="btn btn-secondary" onclick="event.stopPropagation(); app.playMaze('${maze._id}')">Play</button>
            <button class="btn btn-danger" onclick="event.stopPropagation(); app.deleteMaze('${maze._id}')">Delete</button>
          </div>
        ` : ''}
      `;
      listEl.appendChild(item);
    });
  }

  async viewMaze(mazeId) {
    try {
      Formatters.showLoading(true);
      const { maze } = await MazeAPI.getMazeById(mazeId);
      this.currentMaze = maze;
      
      // Show maze in a modal or viewer
      const viewerDiv = document.createElement('div');
      viewerDiv.id = 'maze-viewer-modal';
      viewerDiv.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.9); 
        z-index: 10000; display: flex; flex-direction: column; 
        align-items: center; justify-content: center; padding: 20px;
      `;
      
      viewerDiv.innerHTML = `
        <div style="max-width: 1000px; width: 100%;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2 style="color: #e6e8ff;">${maze.name}</h2>
            <button id="close-viewer-btn" 
                    style="background: #ff1744; color: white; border: none; 
                           padding: 10px 20px; border-radius: 8px; cursor: pointer;">
              ✕ Close
            </button>
          </div>
          <div style="background: rgba(10, 14, 48, 0.95); padding: 20px; border-radius: 16px;">
            <canvas id="view-maze-canvas"></canvas>
            <div style="margin-top: 20px; text-align: center;">
              <button id="play-this-maze-btn" 
                      class="btn btn-primary" style="margin-right: 10px;">
                🎮 Play This Maze
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(viewerDiv);
      
      // Setup close button
      document.getElementById('close-viewer-btn').onclick = () => {
        document.getElementById('maze-viewer-modal').remove();
      };
      
      // Setup play button
      document.getElementById('play-this-maze-btn').onclick = () => {
        document.getElementById('maze-viewer-modal').remove();
        this.playMaze(maze._id);
      };
      
      // Render maze
      setTimeout(() => {
        const canvas = new MazeCanvas('view-maze-canvas', maze.grid);
        canvas.render();
      }, 100);
      
      Formatters.showLoading(false);
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error viewing maze: ${error.message}`, 'error');
    }
  }

  async playMaze(mazeId) {
    try {
      Formatters.showLoading(true);
      const { maze } = await MazeAPI.getMazeById(mazeId);
      this.currentMaze = maze;
      
      // Switch to player page
      document.querySelector('[data-page="player"]').click();
      
      // DON'T auto-start - wait for user to click Start Game
      
      Formatters.showLoading(false);
      Formatters.showToast('Maze loaded! Click "Start Game" when ready.', 'success');
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading maze: ${error.message}`, 'error');
    }
  }

  async deleteMaze(mazeId) {
    if (!confirm('Are you sure you want to delete this maze?')) return;

    try {
      await MazeAPI.deleteMaze(mazeId);
      Formatters.showToast('Maze deleted successfully', 'success');
      this.loadSavedMazes();
    } catch (error) {
      Formatters.showToast(`Error deleting maze: ${error.message}`, 'error');
    }
  }

  async renderPlayer(container) {
    // Load available mazes
    let mazes = [];
    try {
      const data = await MazeAPI.getAllMazes(1, 50);
      mazes = data.mazes;
    } catch (error) {
      console.error('Error loading mazes:', error);
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Play Mode</h2>
          <p>Control Pacman with arrow keys or WASD</p>
        </div>
        
        ${mazes.length > 0 ? `
          <div class="form-group">
            <label for="maze-select">Select a Maze to Play</label>
            <select id="maze-select" class="form-control">
              <option value="">Choose a maze...</option>
              ${mazes.map(m => `
                <option value="${m._id}" ${this.currentMaze && m._id === this.currentMaze._id ? 'selected' : ''}>
                  ${m.name} (${m.config.width}×${m.config.height})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="action-buttons">
            <button class="btn btn-primary" id="load-maze-btn">Load Selected Maze</button>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-text">No mazes available</div>
            <button class="btn btn-primary" onclick="app.loadPage('generator')">Generate a Maze First</button>
          </div>
        `}
        
        ${this.currentMaze ? `
          <div class="maze-canvas-container">
            <canvas id="game-canvas"></canvas>
          </div>
          
          <div class="trajectory-info">
            <div class="trajectory-stat">
              <div class="trajectory-stat-value" id="pellets-count">0</div>
              <div class="trajectory-stat-label">Pellets</div>
            </div>
            <div class="trajectory-stat">
              <div class="trajectory-stat-value" id="time-elapsed">0s</div>
              <div class="trajectory-stat-label">Time</div>
            </div>
            <div class="trajectory-stat">
              <div class="trajectory-stat-value" id="moves-count">0</div>
              <div class="trajectory-stat-label">Moves</div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" id="start-game-btn">Start Game</button>
            <button class="btn btn-secondary" id="pause-game-btn" style="display: none;">Pause</button>
            <button class="btn btn-primary" id="save-trajectory-btn" style="display: none;">Save Trajectory</button>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">🎮</div>
            <div class="empty-state-text">Select a maze to play</div>
            <button class="btn btn-primary" onclick="app.loadPage('generator')">Go to Generator</button>
          </div>
        `}
      </div>
    `;

    if (mazes.length > 0 && !this.currentMaze) {
      document.getElementById('load-maze-btn').addEventListener('click', async () => {
        const mazeId = document.getElementById('maze-select').value;
        if (!mazeId) {
          Formatters.showToast('Please select a maze', 'error');
          return;
        }
        await this.playMaze(mazeId);
      });
    }

    if (this.currentMaze) {
      document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
    }
  }

  startGame() {
    if (!this.currentMaze) {
      Formatters.showToast('Please select a maze first!', 'error');
      return;
    }

    try {
      // Stop any existing game
      if (this.gameEngine) {
        this.gameEngine.stop();
      }

      this.gameEngine = new GameEngine('game-canvas', this.currentMaze.grid, this.currentMaze._id);
      this.gameEngine.start();

      const startBtn = document.getElementById('start-game-btn');
      const pauseBtn = document.getElementById('pause-game-btn');
      const saveBtn = document.getElementById('save-trajectory-btn');
      
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-block';
      if (saveBtn) saveBtn.style.display = 'inline-block';

      if (pauseBtn) {
        pauseBtn.onclick = () => {
          const isPaused = this.gameEngine.togglePause();
          pauseBtn.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
          pauseBtn.className = isPaused ? 'btn btn-primary' : 'btn btn-secondary';
          
          if (isPaused) {
            Formatters.showToast('⏸️ Game Paused', 'info');
          } else {
            Formatters.showToast('▶️ Game Resumed', 'info');
          }
        };
      }

      if (saveBtn) {
        saveBtn.onclick = async () => {
          this.gameEngine.stop();
          
          // Store trajectory for immediate replay
          this.lastRecordedTrajectory = {
            moves: this.gameEngine.getTrajectory(),
            mazeId: this.currentMaze._id,
            grid: this.originalGrid || this.currentMaze.grid // Use original grid with pellets
          };
          
          Formatters.showToast('🎮 Trajectory recorded! Go to AI Simulation to replay it with ghosts!', 'success');
          
          // Optionally save to database
          const save = confirm('Trajectory recorded! Do you want to save it to database? (Optional)');
          if (save) {
            const name = prompt('Enter trajectory name:');
            if (name) {
              try {
                await this.gameEngine.saveTrajectory(name);
                Formatters.showToast('Also saved to database!', 'success');
              } catch (error) {
                Formatters.showToast(`Database save failed (demo mode), but trajectory is still recorded for replay!`, 'info');
              }
            }
          }
        };
      }

      // Update stats periodically
      this.statsInterval = setInterval(() => {
        if (this.gameEngine && this.gameEngine.isRunning) {
          const pelletsEl = document.getElementById('pellets-count');
          const timeEl = document.getElementById('time-elapsed');
          const movesEl = document.getElementById('moves-count');
          
          if (pelletsEl) {
            pelletsEl.textContent = this.gameEngine.pacman.getPelletsEaten();
          }
          if (timeEl) {
            timeEl.textContent = Formatters.formatDuration(this.gameEngine.getElapsedTime());
          }
          if (movesEl) {
            movesEl.textContent = this.gameEngine.trajectory.length;
          }
        }
      }, 100);

    } catch (error) {
      Formatters.showToast(`Error starting game: ${error.message}`, 'error');
    }
  }

  async renderSimulation(container) {
    const hasRecording = this.lastRecordedTrajectory !== null;
    
    // Load saved trajectories
    let trajectories = [];
    try {
      const data = await GameAPI.getAllTrajectories(1, 50);
      trajectories = data.trajectories;
    } catch (error) {
      console.error('Error loading trajectories:', error);
    }
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>🎬 AI Simulation & Replay</h2>
          <p>Watch your recorded game with ghost AI chasing Pacman!</p>
        </div>
        
        ${hasRecording ? `
          <div class="info" style="background: rgba(76, 175, 80, 0.2); border-color: #4caf50;">
            ✅ Last played trajectory ready! Or select a saved one below.
          </div>
        ` : trajectories.length > 0 ? `
          <div class="info" style="background: rgba(99, 116, 255, 0.2); border-color: #6f7dff;">
            📼 Select a saved trajectory below to replay
          </div>
        ` : `
          <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
            ⚠️ No trajectory available. Go to <strong>Play Mode</strong>, play a maze, then save your trajectory!
          </div>
        `}
        
        ${trajectories.length > 0 || hasRecording ? `
          <div class="form-group">
            <label for="trajectory-select">Select Trajectory</label>
            <select id="trajectory-select" class="form-control">
              ${hasRecording ? '<option value="last">🎮 Last Played (In Memory)</option>' : ''}
              ${trajectories.map(t => `
                <option value="${t._id}">
                  ${t.name} - ${t.moves ? t.moves.length : 0} moves
                </option>
              `).join('')}
            </select>
          </div>
        ` : ''}
        
        <div id="ghost-configs" style="${hasRecording ? '' : 'opacity: 0.5; pointer-events: none;'}">
          <h3>👻 Ghost Configuration</h3>
          <p style="color: #9aa4ff; margin-bottom: 15px;">Configure how each ghost will chase Pacman</p>
          <div class="ghost-config-list" id="ghost-config-list">
            ${ConfigPanel.createGhostConfig(0)}
            ${ConfigPanel.createGhostConfig(1)}
            ${ConfigPanel.createGhostConfig(2)}
            ${ConfigPanel.createGhostConfig(3)}
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-primary" id="start-replay-btn" ${hasRecording || trajectories.length > 0 ? '' : 'disabled'}>
            ${hasRecording || trajectories.length > 0 ? '▶️ Start Replay' : '⚠️ Record a trajectory first'}
          </button>
        </div>
      </div>
      
      <div class="card" id="simulation-viewer" style="display: none; margin-top: 24px;">
        <div class="card-header">
          <h2>🎮 Live Simulation</h2>
          <p>Watching your recorded game with AI ghosts</p>
        </div>
        
        <div class="maze-canvas-container">
          <canvas id="simulation-canvas"></canvas>
        </div>
        
        <div class="replay-controls">
          <button class="btn btn-secondary" id="replay-play-btn">▶️ Play</button>
          <button class="btn btn-secondary" id="replay-pause-btn">⏸️ Pause</button>
          <button class="btn btn-secondary" id="replay-reset-btn">🔄 Reset</button>
          <div class="replay-progress" id="replay-progress">
            <div class="replay-progress-bar" id="replay-progress-bar"></div>
          </div>
        </div>
        
        <div class="trajectory-info">
          <div class="trajectory-stat">
            <div class="trajectory-stat-value" id="sim-frame">0</div>
            <div class="trajectory-stat-label">Frame</div>
          </div>
          <div class="trajectory-stat">
            <div class="trajectory-stat-value" id="sim-progress">0%</div>
            <div class="trajectory-stat-label">Progress</div>
          </div>
          <div class="trajectory-stat">
            <div class="trajectory-stat-value" id="sim-status">Ready</div>
            <div class="trajectory-stat-label">Status</div>
          </div>
        </div>
      </div>
    `;

    if (hasRecording || trajectories.length > 0) {
      document.getElementById('start-replay-btn').addEventListener('click', async () => {
        const selected = document.getElementById('trajectory-select').value;
        
        if (selected === 'last') {
          // Use last recorded trajectory
          this.startReplay();
        } else {
          // Load trajectory from database
          await this.loadAndReplayTrajectory(selected);
        }
      });
    }
  }

  async loadAndReplayTrajectory(trajectoryId) {
    try {
      Formatters.showLoading(true);
      
      const { trajectory } = await GameAPI.getTrajectoryById(trajectoryId);
      const { maze } = await MazeAPI.getMazeById(trajectory.mazeId);
      
      // Set up trajectory for replay
      this.lastRecordedTrajectory = {
        moves: trajectory.moves,
        mazeId: maze._id,
        grid: maze.grid
      };
      
      Formatters.showLoading(false);
      
      // Start replay
      this.startReplay();
      
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading trajectory: ${error.message}`, 'error');
    }
  }

  startReplay() {
    if (!this.lastRecordedTrajectory) {
      Formatters.showToast('No trajectory available!', 'error');
      return;
    }

    try {
      const ghostConfigs = ConfigPanel.getGhostConfigValues();
      
      // Show simulation viewer
      document.getElementById('simulation-viewer').style.display = 'block';
      
      // Create simulation viewer
      this.simulationViewer = new SimulationViewer(
        'simulation-canvas',
        this.lastRecordedTrajectory.grid,
        this.lastRecordedTrajectory.moves,
        ghostConfigs
      );
      
      // Callback when simulation completes
      this.simulationViewer.onSimulationComplete = (results) => {
        this.promptSaveSimulation(results);
      };

      // Setup controls
      document.getElementById('replay-play-btn').onclick = () => {
        this.simulationViewer.play();
        document.getElementById('sim-status').textContent = 'Playing';
      };

      document.getElementById('replay-pause-btn').onclick = () => {
        this.simulationViewer.pause();
        document.getElementById('sim-status').textContent = 'Paused';
      };

      document.getElementById('replay-reset-btn').onclick = () => {
        this.simulationViewer.reset();
        document.getElementById('sim-status').textContent = 'Reset';
        document.getElementById('sim-frame').textContent = '0';
        document.getElementById('sim-progress').textContent = '0%';
      };

      // Update stats periodically
      setInterval(() => {
        if (this.simulationViewer) {
          document.getElementById('sim-frame').textContent = this.simulationViewer.currentFrame;
          const progress = this.simulationViewer.getProgress().toFixed(1);
          document.getElementById('sim-progress').textContent = `${progress}%`;
          
          // Update progress bar
          document.getElementById('replay-progress-bar').style.width = `${progress}%`;
        }
      }, 100);

      // Initial render
      this.simulationViewer.render();
      
      Formatters.showToast('🎬 Simulation ready! Click Play to watch!', 'success');
      
      // Scroll to viewer
      document.getElementById('simulation-viewer').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      Formatters.showToast(`Error starting replay: ${error.message}`, 'error');
    }
  }

  displayTrajectoryList(trajectories, containerId) {
    const container = document.getElementById(containerId);
    
    if (trajectories.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No trajectories found</p></div>';
      return;
    }

    container.innerHTML = '<div class="maze-list"></div>';
    const listEl = container.querySelector('.maze-list');

    trajectories.forEach(traj => {
      const item = document.createElement('div');
      item.className = 'maze-item';
      item.innerHTML = `
        <h3>${traj.name}</h3>
        <div class="maze-item-details">
          <p><strong>Moves:</strong> ${traj.moves.length}</p>
          <p><strong>Duration:</strong> ${Formatters.formatDuration(traj.duration)}</p>
          <p><strong>Pellets:</strong> ${traj.pelletsCollected}/${traj.totalPellets}</p>
        </div>
      `;
      listEl.appendChild(item);
    });
  }
  
  async promptSaveSimulation(results) {
    const save = confirm(`Simulation complete! ${results.caught ? '👻 Pacman was caught!' : '✅ Pacman escaped!'}\n\nDo you want to save this simulation?`);
    
    if (save) {
      const name = prompt('Enter simulation name:');
      if (name) {
        try {
          Formatters.showLoading(true);
          
          const simulationData = {
            name,
            trajectoryId: this.lastRecordedTrajectory.trajectoryId || 'demo-trajectory',
            mazeId: this.lastRecordedTrajectory.mazeId,
            ghostConfigs: this.simulationViewer.ghostConfigs,
            results
          };
          
          const response = await GameAPI.saveSimulation(simulationData);
          
          Formatters.showLoading(false);
          Formatters.showToast(`✅ Simulation saved: ${name}`, 'success');
        } catch (error) {
          Formatters.showLoading(false);
          Formatters.showToast(`Simulation results recorded but save failed (demo mode): ${error.message}`, 'info');
        }
      }
    }
  }
}

// Initialize app
const app = new PacmanLabApp();

