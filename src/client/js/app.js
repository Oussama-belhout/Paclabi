/**
 * Main Application - Pacman Lab
 */

class PacmanLabApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.currentMaze = null;
    this.currentTrajectory = null;
    this.currentBatchId = null;
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
      case 'results':
        await this.renderResults(container);
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
          ${maze.rating.user ? `<p><strong>Rating:</strong> ${'★'.repeat(maze.rating.user)}</p>` : ''}
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
                Play This Maze
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
            <button class="btn btn-success" id="view-stats-btn" style="display: none;">View Statistics</button>
          </div>
          
          <div id="game-stats-panel" style="display: none; margin-top: 20px; padding: 20px; background: rgba(99, 116, 255, 0.1); border-radius: 8px; border: 1px solid rgba(99, 116, 255, 0.3);">
            <h3 style="margin-bottom: 15px;">Game Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div class="stat-item">
                <strong>Maze:</strong> <span id="stat-maze-name">-</span>
              </div>
              <div class="stat-item">
                <strong>Duration:</strong> <span id="stat-duration">-</span>
              </div>
              <div class="stat-item">
                <strong>Total Moves:</strong> <span id="stat-moves">-</span>
              </div>
              <div class="stat-item">
                <strong>Pellets Collected:</strong> <span id="stat-pellets">-</span>
              </div>
              <div class="stat-item">
                <strong>Completion:</strong> <span id="stat-completion">-</span>
              </div>
              <div class="stat-item">
                <strong>Avg Speed:</strong> <span id="stat-speed">-</span>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <strong>Trajectory Info:</strong>
              <div style="color: #9aa4ff; margin-top: 5px;">
                <span id="stat-trajectory-status">Ready for replay in AI Simulation mode</span>
              </div>
            </div>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">▶</div>
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

      // Store original grid before game modifies it
      this.originalGrid = JSON.parse(JSON.stringify(this.currentMaze.grid));
      
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
          pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
          pauseBtn.className = isPaused ? 'btn btn-primary' : 'btn btn-secondary';
          
          if (isPaused) {
            Formatters.showToast('Game Paused', 'info');
          } else {
            Formatters.showToast('Game Resumed', 'info');
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
            grid: this.originalGrid || this.currentMaze.grid, // Use original grid with pellets
            trajectoryId: null // Will be set if saved to DB
          };
          
          // Calculate and display statistics
          const trajectory = this.gameEngine.getTrajectory();
          const duration = this.gameEngine.getElapsedTime();
          const pelletsCollected = this.gameEngine.pacman.getPelletsEaten();
          const totalPellets = this.gameEngine.totalPellets;
          
          document.getElementById('stat-maze-name').textContent = this.currentMaze.name || 'Unnamed Maze';
          document.getElementById('stat-duration').textContent = (duration / 1000).toFixed(1) + 's';
          document.getElementById('stat-moves').textContent = trajectory.length;
          document.getElementById('stat-pellets').textContent = `${pelletsCollected}/${totalPellets}`;
          document.getElementById('stat-completion').textContent = ((pelletsCollected / totalPellets) * 100).toFixed(1) + '%';
          document.getElementById('stat-speed').textContent = (trajectory.length / (duration / 1000)).toFixed(2) + ' moves/s';
          
          // Show statistics panel
          document.getElementById('game-stats-panel').style.display = 'block';
          document.getElementById('view-stats-btn').style.display = 'inline-block';
          
          Formatters.showToast('Trajectory recorded! Go to AI Simulation to replay it with ghosts!', 'success');
          
          // Optionally save to database
          const save = confirm('Trajectory recorded! Do you want to save it to database? (Optional)');
          if (save) {
            const name = prompt('Enter trajectory name:');
            if (name) {
              try {
                const response = await this.gameEngine.saveTrajectory(name);
                // Store trajectory ID for simulation saving
                if (response && response.trajectory && response.trajectory._id) {
                  this.lastRecordedTrajectory.trajectoryId = response.trajectory._id;
                  document.getElementById('stat-trajectory-status').textContent = 
                    `Saved to database as "${name}" - Ready for replay`;
                }
                Formatters.showToast('Also saved to database!', 'success');
              } catch (error) {
                Formatters.showToast(`Database save failed (demo mode), but trajectory is still recorded for replay!`, 'info');
                document.getElementById('stat-trajectory-status').textContent = 
                  'Recorded in memory only - Ready for replay in AI Simulation';
              }
            }
          }
        };
      }
      
      // View stats button handler
      const viewStatsBtn = document.getElementById('view-stats-btn');
      if (viewStatsBtn) {
        viewStatsBtn.onclick = () => {
          const statsPanel = document.getElementById('game-stats-panel');
          if (statsPanel.style.display === 'none') {
            statsPanel.style.display = 'block';
            viewStatsBtn.textContent = 'Hide Statistics';
          } else {
            statsPanel.style.display = 'none';
            viewStatsBtn.textContent = 'View Statistics';
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
          <h2>AI Simulation & Replay</h2>
          <p>Configure Pacman and ghost AI for simulation</p>
        </div>
        
        <!-- Pacman Configuration Widget -->
        <div class="simulation-section">
          <h3 style="margin-bottom: 15px; color: #6f7dff;">Pacman Configuration</h3>
          
          <div class="simulation-nav-tabs">
            <button class="simulation-tab-btn active" data-tab="trajectory">
              <span class="tab-icon">▶</span>
              Trajectory Simulation
            </button>
            <button class="simulation-tab-btn" data-tab="bot">
              <span class="tab-icon">◉</span>
              Bot Simulation
            </button>
          </div>

          <!-- Trajectory Simulation Tab -->
          <div id="tab-trajectory" class="simulation-tab-content active">
            ${hasRecording ? `
              <div class="info" style="background: rgba(76, 175, 80, 0.2); border-color: #4caf50;">
                Last played trajectory ready! Or select a saved one below.
              </div>
            ` : trajectories.length > 0 ? `

            ` : `
              <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
                No trajectory available. Go to <strong>Play Mode</strong>, play a maze, then save your trajectory!
              </div>
            `}
            
            ${trajectories.length > 0 || hasRecording ? `
              <div class="form-group">
                <label for="trajectory-select">Select Trajectory</label>
                <select id="trajectory-select" class="form-control">
                  ${hasRecording ? '<option value="last">Last Played (In Memory)</option>' : ''}
                  ${trajectories.map(t => `
                    <option value="${t._id}">
                      ${t.name} - ${t.moves ? t.moves.length : 0} moves
                    </option>
                  `).join('')}
                </select>
              </div>
            ` : ''}
          </div>

          <!-- Bot Simulation Tab -->
          <div id="tab-bot" class="simulation-tab-content">

            
            <div class="form-group">
              <label for="pacman-algorithm-select">Pacman Algorithm</label>
              <select id="pacman-algorithm-select" class="form-control">
                <option value="greedy">Greedy - Always moves towards nearest pellet</option>
                <option value="defensive">Defensive - Prioritizes staying away from ghosts</option>
                <option value="aggressive">Aggressive - Focuses on collecting pellets quickly</option>
                <option value="random">Random Walker - Random movement with ghost avoidance</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="bot-maze-select">Select Maze for Bot</label>
              <select id="bot-maze-select" class="form-control">
                <option value="">Loading mazes...</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Ghost Configuration Widget -->
        <div class="simulation-section" style="margin-top: 32px;">
          <h3 style="margin-bottom: 15px; color: #6f7dff;">Ghost Configuration</h3>
          <p style="color: #9aa4ff; margin-bottom: 15px;">Configure how each ghost will chase Pacman</p>
          
          <div id="ghost-configs">
            <div class="ghost-config-list" id="ghost-config-list">
              ${ConfigPanel.createGhostConfig(0)}
              ${ConfigPanel.createGhostConfig(1)}
              ${ConfigPanel.createGhostConfig(2)}
              ${ConfigPanel.createGhostConfig(3)}
            </div>
          </div>
        </div>
        
        <div class="action-buttons" style="margin-top: 32px;">
          <button class="btn btn-primary" id="start-replay-btn">
            Start Simulation
          </button>
        </div>
      </div>
      
      <div class="card" id="simulation-viewer" style="display: none; margin-top: 24px;">
        <div class="card-header">
          <h2>Live Simulation</h2>
          <p>Watching AI simulation</p>
        </div>
        
        <div class="maze-canvas-container">
          <canvas id="simulation-canvas"></canvas>
        </div>
        
        <div class="replay-controls">
          <button class="btn btn-secondary" id="replay-play-btn">Play</button>
          <button class="btn btn-secondary" id="replay-pause-btn">Pause</button>
          <button class="btn btn-secondary" id="replay-reset-btn">Reset</button>
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

    // Setup tab navigation
    this.setupSimulationTabs();

    // Load mazes for bot mode
    this.loadMazesForBot();

    // Setup start button
    document.getElementById('start-replay-btn').addEventListener('click', async () => {
      const activeTab = document.querySelector('.simulation-tab-btn.active').getAttribute('data-tab');
      
      if (activeTab === 'trajectory') {
        const selected = document.getElementById('trajectory-select');
        if (!selected || selected.options.length === 0) {
          Formatters.showToast('No trajectory available', 'error');
          return;
        }
        
        if (selected.value === 'last') {
          this.startReplay();
        } else {
          await this.loadAndReplayTrajectory(selected.value);
        }
      } else {
        // Bot mode
        await this.startBotSimulation();
      }
    });
  }

  setupSimulationTabs() {
    const tabButtons = document.querySelectorAll('.simulation-tab-btn');
    const tabContents = document.querySelectorAll('.simulation-tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
      });
    });
  }

  async loadMazesForBot() {
    try {
      const response = await MazeAPI.getAllMazes(1, 50);
      const mazes = response.mazes || [];
      
      const select = document.getElementById('bot-maze-select');
      if (select) {
        select.innerHTML = mazes.length > 0 
          ? mazes.map(m => `<option value="${m._id}">${m.name} (${m.config.width}x${m.config.height})</option>`).join('')
          : '<option value="">No mazes available</option>';
      }
    } catch (error) {
      console.error('Error loading mazes:', error);
    }
  }

  async startBotSimulation() {
    const algorithm = document.getElementById('pacman-algorithm-select').value;
    const mazeId = document.getElementById('bot-maze-select').value;
    
    if (!mazeId) {
      Formatters.showToast('Please select a maze', 'error');
      return;
    }
    
    try {
      Formatters.showLoading(true);
      
      // Load the maze
      const { maze } = await MazeAPI.getMazeById(mazeId);
      
      if (!maze || !maze.grid) {
        throw new Error('Invalid maze data');
      }
      
      // Find Pacman's starting position in the maze
      let pacmanStart = null;
      for (let y = 0; y < maze.grid.length; y++) {
        for (let x = 0; x < maze.grid[y].length; x++) {
          if (maze.grid[y][x] === 2) { // 2 is Pacman's starting position
            pacmanStart = { y, x };
            break;
          }
        }
        if (pacmanStart) break;
      }
      
      // If no starting position found, use a default one
      if (!pacmanStart) {
        pacmanStart = { y: 1, x: 1 };
      }
      
      // Create an initial trajectory with just the starting position
      // The bot will generate moves dynamically during simulation
      const initialMoves = [{ ...pacmanStart, timestamp: Date.now() }];
      
      this.lastRecordedTrajectory = {
        moves: initialMoves,
        mazeId: maze._id,
        grid: maze.grid,
        botMode: true,
        botAlgorithm: algorithm,
        trajectoryId: 'bot-simulation'
      };
      
      Formatters.showLoading(false);
      Formatters.showToast(`Starting bot simulation with ${algorithm} algorithm`, 'info');
      
      // Start replay (which will handle bot mode)
      this.startReplay();
      
    } catch (error) {
      Formatters.showLoading(false);
      console.error('Error starting bot simulation:', error);
      Formatters.showToast(`Error: ${error.message}`, 'error');
    }
  }

  async loadAndReplayTrajectory(trajectoryId) {
    try {
      Formatters.showLoading(true);
      
      const { trajectory } = await GameAPI.getTrajectoryById(trajectoryId);
      
      if (!trajectory || !trajectory.moves || trajectory.moves.length === 0) {
        throw new Error('Invalid trajectory data');
      }
      
      // Check if mazeId is already populated (full object) or just an ID
      let maze;
      if (typeof trajectory.mazeId === 'object' && trajectory.mazeId._id) {
        // Already populated
        maze = trajectory.mazeId;
      } else {
        // Need to fetch the maze
        const response = await MazeAPI.getMazeById(trajectory.mazeId);
        maze = response.maze;
      }
      
      if (!maze || !maze.grid) {
        throw new Error('Invalid maze data for trajectory');
      }
      
      // Set up trajectory for replay
      this.lastRecordedTrajectory = {
        moves: trajectory.moves,
        mazeId: maze._id,
        grid: maze.grid,
        trajectoryId: trajectory._id
      };
      
      console.log('Loaded trajectory with grid:', maze.grid.length, 'x', maze.grid[0]?.length);
      
      Formatters.showLoading(false);
      
      // Start replay
      this.startReplay();
      
    } catch (error) {
      Formatters.showLoading(false);
      console.error('Error loading trajectory:', error);
      Formatters.showToast(`Error loading trajectory: ${error.message}`, 'error');
    }
  }

  startReplay() {
    if (!this.lastRecordedTrajectory) {
      Formatters.showToast('No trajectory available!', 'error');
      return;
    }
    
    if (!this.lastRecordedTrajectory.grid || !Array.isArray(this.lastRecordedTrajectory.grid)) {
      Formatters.showToast('Invalid trajectory data - no grid found!', 'error');
      console.error('Invalid trajectory:', this.lastRecordedTrajectory);
      return;
    }
    
    if (!this.lastRecordedTrajectory.moves || !Array.isArray(this.lastRecordedTrajectory.moves)) {
      Formatters.showToast('Invalid trajectory data - no moves found!', 'error');
      console.error('Invalid trajectory:', this.lastRecordedTrajectory);
      return;
    }

    try {
      const ghostConfigs = ConfigPanel.getGhostConfigValues();
      
      console.log('Starting replay with:');
      console.log('- Grid:', this.lastRecordedTrajectory.grid.length, 'x', this.lastRecordedTrajectory.grid[0]?.length);
      console.log('- Moves:', this.lastRecordedTrajectory.moves.length);
      console.log('- Ghosts:', ghostConfigs.length);
      
      // Show simulation viewer
      document.getElementById('simulation-viewer').style.display = 'block';
      
      // Check if this is bot mode
      const isBotMode = this.lastRecordedTrajectory.botMode || false;
      const botAlgorithm = this.lastRecordedTrajectory.botAlgorithm || null;
      
      console.log('- Bot Mode:', isBotMode, '| Algorithm:', botAlgorithm);
      
      // Create simulation viewer
      this.simulationViewer = new SimulationViewer(
        'simulation-canvas',
        this.lastRecordedTrajectory.grid,
        this.lastRecordedTrajectory.moves,
        ghostConfigs,
        isBotMode,
        botAlgorithm
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

      Formatters.showToast('Simulation ready! Maze loaded. Click Play to watch!', 'success');
      
      // Scroll to viewer
      document.getElementById('simulation-viewer').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error starting replay:', error);
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
  
  async renderResults(container) {
    // Check if we're viewing a specific batch
    const batchId = this.currentBatchId;

    if (batchId) {
      // Render batch view
      await this.renderBatchView(container, batchId);
    } else {
      // Render combined view with both batches and simulations
      await this.renderCombinedResultsView(container);
    }
  }

  async renderCombinedResultsView(container) {
    container.innerHTML = `
      <div class="card">
        <div class="results-nav-tabs">
          <button class="results-tab-btn active" data-tab="simulations">
            <span class="tab-icon">▣</span>
            Simulations
          </button>
          <button class="results-tab-btn" data-tab="batches">
            <span class="tab-icon">≡</span>
            Batches
          </button>
        </div>

        <!-- Simulations Tab Content -->
        <div id="tab-simulations" class="results-tab-content active">
          <div class="card-header">
            <h2>All Simulations</h2>
            <p>View and manage individual simulations</p>
          </div>
          <div id="simulations-list"></div>
        </div>

        <!-- Batches Tab Content -->
        <div id="tab-batches" class="results-tab-content">
          <div class="card-header">
            <h2>Simulation Batches</h2>
            <p>Organize simulations by batch</p>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" id="create-batch-btn">Create New Batch</button>
          </div>
          
          <div id="batches-list"></div>
        </div>
      </div>
    `;

    try {
      Formatters.showLoading(true);
      
      // Load both batches and simulations in parallel
      const [batchesResponse, simulationsResponse] = await Promise.all([
        GameAPI.getAllBatches(1, 100),
        GameAPI.getAllSimulations(1, 100)
      ]);

      const batches = batchesResponse.batches || [];
      const simulations = simulationsResponse.simulations || [];

      Formatters.showLoading(false);

      // Render simulations
      if (simulations.length === 0) {
        document.getElementById('simulations-list').innerHTML = `
          <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
            No saved simulations yet. Run a simulation in AI Simulation mode and save it!
          </div>
        `;
      } else {
        this.renderSimulationsList(simulations);
      }

      // Render batches
      if (batches.length === 0) {
        document.getElementById('batches-list').innerHTML = `
          <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
            No batches created yet. Create one to start organizing simulations!
          </div>
        `;
      } else {
        this.renderBatchesTable(batches);
      }

      // Setup tab navigation
      this.setupResultsTabs();

      // Setup event listener for create batch button
      document.getElementById('create-batch-btn').addEventListener('click', () => {
        this.showCreateBatchDialog();
      });
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading results: ${error.message}`, 'error');
    }
  }

  setupResultsTabs() {
    const tabButtons = document.querySelectorAll('.results-tab-btn');
    const tabContents = document.querySelectorAll('.results-tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
      });
    });
  }

  renderBatchesTable(batches) {
    const listEl = document.getElementById('batches-list');
    listEl.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'batches-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Simulations</th>
        <th>Escape Rate</th>
        <th>Mean Duration</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    batches.forEach((batch) => {
      const row = document.createElement('tr');
      row.className = 'batches-table-row';
      row.style.cursor = 'pointer';

      const escapeRate = batch.stats.totalSimulations > 0 
        ? batch.stats.escapeRate.toFixed(1) 
        : 'N/A';
      const meanDuration = batch.stats.totalSimulations > 0
        ? Formatters.formatDuration(batch.stats.meanDuration)
        : 'N/A';
      const createdDate = Formatters.formatDate(batch.createdAt);

      row.innerHTML = `
        <td class="col-name"><strong>${batch.name}</strong></td>
        <td class="col-count">${batch.stats.totalSimulations}</td>
        <td class="col-escape-rate">
          <span class="escape-rate-badge" style="background-color: ${batch.stats.escapeRate >= 50 ? '#4caf5020' : '#ff525220'}; color: ${batch.stats.escapeRate >= 50 ? '#4caf50' : '#ff5252'};">
            ${escapeRate}%
          </span>
        </td>
        <td class="col-duration">${meanDuration}</td>
        <td class="col-created">${createdDate}</td>
        <td class="col-actions">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); app.deleteBatch('${batch._id}')">
            Delete
          </button>
        </td>
      `;

      row.addEventListener('click', () => {
        this.currentBatchId = batch._id;
        this.loadPage('results');
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    listEl.appendChild(table);
  }

  async renderBatchView(container, batchId) {
    try {
      Formatters.showLoading(true);
      const response = await GameAPI.getBatchById(batchId);
      const batch = response.batch;
      Formatters.showLoading(false);

      const stats = batch.stats;
      const escapeRate = stats.totalSimulations > 0 ? stats.escapeRate.toFixed(1) : 0;
      const meanDuration = stats.totalSimulations > 0 ? Formatters.formatDuration(stats.meanDuration) : 'N/A';

      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h2>${batch.name}</h2>
                <p>Batch analysis and statistics</p>
              </div>
              <button class="btn btn-secondary" id="back-to-batches-btn">← Back to Batches</button>
            </div>
          </div>
        </div>

        <!-- Batch Statistics -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <h3>Batch Statistics</h3>
          </div>
          <div class="batch-stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Simulations</div>
              <div class="stat-value">${stats.totalSimulations}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Escaped</div>
              <div class="stat-value" style="color: #4caf50;">${stats.escapedCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Caught</div>
              <div class="stat-value" style="color: #ff5252;">${stats.caughtCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Escape Rate</div>
              <div class="stat-value">${escapeRate}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Mean Duration</div>
              <div class="stat-value">${meanDuration}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Mean Frames</div>
              <div class="stat-value">${stats.meanFrames}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Min Duration</div>
              <div class="stat-value">${Formatters.formatDuration(stats.minDuration)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Max Duration</div>
              <div class="stat-value">${Formatters.formatDuration(stats.maxDuration)}</div>
            </div>
          </div>
        </div>

        <!-- Simulations Table -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <h3>Simulations in Batch</h3>
            <p>${batch.simulations.length} simulations</p>
          </div>
          <div id="batch-simulations-list"></div>
        </div>
      `;

      // Setup back button
      document.getElementById('back-to-batches-btn').addEventListener('click', () => {
        this.currentBatchId = null;
        this.loadPage('results');
      });

      // Render simulations table
      if (batch.simulations.length > 0) {
        this.renderSimulationsTableForBatch(batch.simulations);
      } else {
        document.getElementById('batch-simulations-list').innerHTML = `
          <div class="info" style="background: rgba(255, 152, 0, 0.2); border-color: #ff9800;">
            No simulations in this batch yet. Add some simulations to analyze them!
          </div>
        `;
      }
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading batch: ${error.message}`, 'error');
    }
  }

  renderSimulationsTableForBatch(simulations) {
    const listEl = document.getElementById('batch-simulations-list');
    listEl.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'simulations-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Outcome</th>
        <th>Duration</th>
        <th>Frames</th>
        <th>Maze</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    simulations.forEach((sim) => {
      const row = document.createElement('tr');
      row.className = 'simulations-table-row';
      row.style.cursor = 'pointer';

      const outcome = sim.results.caught ? 'Caught' : 'Escaped';
      const outcomeColor = sim.results.caught ? '#ff5252' : '#4caf50';
      const duration = Formatters.formatDuration(sim.results.duration || 0);
      const frames = sim.results.totalFrames || 0;
      const mazeIdStr = typeof sim.mazeId === 'string' ? sim.mazeId : (sim.mazeId?._id || sim.mazeId?.name || 'N/A');
      const mazeName = typeof sim.mazeId === 'object' ? sim.mazeId?.name : 'N/A';
      const mazeId = mazeIdStr.substring(0, 8) + '...';
      const createdDate = Formatters.formatDate(sim.createdAt);

      row.innerHTML = `
        <td class="col-name"><strong>${sim.name}</strong></td>
        <td class="col-outcome">
          <span class="outcome-badge" style="background-color: ${outcomeColor}20; color: ${outcomeColor}; border: 1px solid ${outcomeColor};">
            ${outcome}
          </span>
        </td>
        <td class="col-duration">${duration}</td>
        <td class="col-frames">${frames}</td>
        <td class="col-maze" title="${mazeName || mazeIdStr}">${mazeId}</td>
        <td class="col-created">${createdDate}</td>
        <td class="col-actions">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); app.viewSimulationDetails('${sim._id}')">
            Details
          </button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); app.removeFromBatch('${this.currentBatchId}', '${sim._id}')">
            Remove
          </button>
        </td>
      `;

      row.addEventListener('click', () => {
        this.viewSimulationDetails(sim._id);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    listEl.appendChild(table);
  }

  showCreateBatchDialog() {
    const batchName = prompt('Enter batch name:');
    if (!batchName || batchName.trim() === '') return;

    const batchDescription = prompt('Enter batch description (optional):');

    this.createBatch(batchName.trim(), batchDescription ? batchDescription.trim() : '');
  }

  async createBatch(name, description) {
    try {
      Formatters.showLoading(true);
      await GameAPI.createBatch(name, description);
      Formatters.showLoading(false);
      Formatters.showToast(`Batch "${name}" created successfully`, 'success');
      this.loadPage('results');
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error creating batch: ${error.message}`, 'error');
    }
  }

  async deleteBatch(batchId) {
    if (!confirm('Are you sure you want to delete this batch? Simulations will not be deleted.')) {
      return;
    }

    try {
      await GameAPI.deleteBatch(batchId);
      Formatters.showToast('Batch deleted successfully', 'success');
      this.loadPage('results');
    } catch (error) {
      Formatters.showToast(`Error deleting batch: ${error.message}`, 'error');
    }
  }

  async removeFromBatch(batchId, simulationId) {
    if (!confirm('Remove this simulation from batch?')) {
      return;
    }

    try {
      Formatters.showLoading(true);
      await GameAPI.removeSimulationFromBatch(batchId, simulationId);
      Formatters.showLoading(false);
      Formatters.showToast('Simulation removed from batch', 'success');
      // Reload batch view
      this.renderBatchView(document.getElementById('app-container'), batchId);
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error removing simulation: ${error.message}`, 'error');
    }
  }
  
  renderSimulationsList(simulations) {
    const listEl = document.getElementById('simulations-list');
    if (!listEl) {
      console.error('simulations-list element not found');
      return;
    }
    
    console.log('Rendering simulations table with', simulations.length, 'simulations');
    listEl.innerHTML = '';
    
    if (simulations.length === 0) {
      console.log('No simulations to display');
      return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'simulations-table';
    console.log('Table created with class:', table.className);
    
    // Create header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Outcome</th>
        <th>Duration</th>
        <th>Ghosts</th>
        <th>Maze ID</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    simulations.forEach((sim, idx) => {
      const row = document.createElement('tr');
      
      // Calculate some stats
      const outcome = sim.results.caught ? 'Caught' : 'Escaped';
      const outcomeColor = sim.results.caught ? '#ff5252' : '#4caf50';
      const duration = Formatters.formatDuration(sim.results.duration || 0);
      const ghostCount = sim.ghostConfigs ? sim.ghostConfigs.length : 0;
      
      // Handle mazeId - it can be a string or an object
      const mazeIdStr = typeof sim.mazeId === 'string' ? sim.mazeId : (sim.mazeId?._id || sim.mazeId?.name || 'N/A');
      const mazeName = typeof sim.mazeId === 'object' ? sim.mazeId?.name : 'N/A';
      const mazeId = mazeIdStr.substring(0, 8) + '...';
      
      const createdDate = Formatters.formatDate(sim.createdAt);
      
      console.log(`Adding row ${idx}: ${sim.name}`);
      
      row.className = 'simulations-table-row';
      row.style.cursor = 'pointer';
      
      row.innerHTML = `
        <td class="col-name"><strong>${sim.name}</strong></td>
        <td class="col-outcome">
          <span class="outcome-badge" style="background-color: ${outcomeColor}20; color: ${outcomeColor}; border: 1px solid ${outcomeColor};">
            ${outcome}
          </span>
        </td>
        <td class="col-duration">${duration}</td>
        <td class="col-ghosts">${ghostCount}</td>
        <td class="col-maze" title="${mazeName || mazeIdStr}">${mazeId}</td>
        <td class="col-created">${createdDate}</td>
        <td class="col-actions">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); app.viewSimulationDetails('${sim._id}')">
            Details
          </button>
          <button class="btn btn-info btn-sm" onclick="event.stopPropagation(); app.showClassifyDialog('${sim._id}')">
            Classify
          </button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); app.deleteSimulation('${sim._id}')">
            Delete
          </button>
        </td>
      `;
      
      // Add click handler to view details
      row.addEventListener('click', () => {
        this.viewSimulationDetails(sim._id);
      });
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    listEl.appendChild(table);
    console.log('Table appended to DOM. Table element:', table);
  }
  
  async viewSimulationDetails(simulationId) {
    try {
      Formatters.showLoading(true);
      const response = await GameAPI.getSimulationById(simulationId, false);
      const sim = response.simulation;
      
      Formatters.showLoading(false);
      
      // Create modal overlay
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        overflow-y: auto;
        padding: 40px 20px;
      `;
      
      const outcome = sim.results.caught ? 'Pacman was Caught' : 'Pacman Escaped';
      const outcomeColor = sim.results.caught ? '#ff5252' : '#4caf50';
      const caughtBy = sim.results.caughtByGhost ? ` by ${sim.results.caughtByGhost.toUpperCase()}` : '';
      
      modal.innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto; background: rgba(10, 14, 48, 0.98); padding: 30px; border-radius: 16px; border: 1px solid rgba(99, 116, 255, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px;">
            <div>
              <h2 style="color: #fff; margin-bottom: 10px;">${sim.name}</h2>
              <p style="color: #9aa4ff;">Simulation Details</p>
            </div>
            <button id="close-modal" class="btn btn-secondary">Close</button>
          </div>
          
          <!-- Outcome Summary -->
          <div style="background: rgba(99, 116, 255, 0.1); padding: 20px; border-radius: 8px; border: 2px solid ${outcomeColor}; margin-bottom: 30px;">
            <h3 style="color: ${outcomeColor}; margin-bottom: 10px;">${outcome}${caughtBy}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
              <div>
                <strong>Duration:</strong> ${Formatters.formatDuration(sim.results.duration || 0)}
              </div>
              <div>
                <strong>Total Frames:</strong> ${sim.results.totalFrames || 0}
              </div>
              ${sim.results.caught ? `
                <div>
                  <strong>Caught At:</strong> Frame ${sim.results.caughtFrame || 'N/A'}
                </div>
                <div>
                  <strong>Time to Catch:</strong> ${Formatters.formatDuration(sim.results.caughtTime || 0)}
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Maze Information -->
          <div style="background: rgba(99, 116, 255, 0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Maze Information</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
              <div>
                <strong>Maze ID:</strong><br/>
                <code style="color: #9aa4ff; word-break: break-all;">${sim.mazeId || 'N/A'}</code>
              </div>
              <div>
                <strong>Trajectory ID:</strong><br/>
                <code style="color: #9aa4ff; word-break: break-all;">${sim.trajectoryId || 'N/A'}</code>
              </div>
            </div>
          </div>
          
          <!-- Ghost Configurations -->
          <div style="background: rgba(99, 116, 255, 0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Ghost Configurations (${sim.ghostConfigs ? sim.ghostConfigs.length : 0} Ghosts)</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
              ${sim.ghostConfigs && sim.ghostConfigs.length > 0 ? sim.ghostConfigs.map((ghost, idx) => `
                <div style="background: rgba(10, 14, 48, 0.5); padding: 15px; border-radius: 8px; border: 1px solid rgba(99, 116, 255, 0.2);">
                  <h4 style="color: #fff; margin-bottom: 10px;">Ghost ${idx + 1}: ${ghost.ghostType ? ghost.ghostType.toUpperCase() : 'Unknown'}</h4>
                  <div style="font-size: 14px;">
                    <p><strong>Type:</strong> ${ghost.ghostType || 'N/A'}</p>
                    <p><strong>Start Position:</strong> (${ghost.startPosition ? ghost.startPosition.x : 'N/A'}, ${ghost.startPosition ? ghost.startPosition.y : 'N/A'})</p>
                    <p><strong>Behavior:</strong> ${this.getGhostBehaviorDescription(ghost.ghostType)}</p>
                  </div>
                </div>
              `).join('') : '<p style="color: #9aa4ff;">No ghost configurations available</p>'}
            </div>
          </div>
          
          <!-- Pacman Information -->
          <div style="background: rgba(99, 116, 255, 0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Pacman Information</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div>
                <strong>Total Frames:</strong> ${sim.results.totalFrames || 0}
              </div>
              <div>
                <strong>Survival Time:</strong> ${Formatters.formatDuration(sim.results.duration || 0)}
              </div>
              ${sim.results.caught ? `
                <div>
                  <strong>Caught By:</strong> ${sim.results.caughtByGhost ? sim.results.caughtByGhost.toUpperCase() : 'Unknown'}
                </div>
              ` : `
                <div style="color: #4caf50;">
                  <strong>Status:</strong> Successfully Escaped
                </div>
              `}
            </div>
          </div>
          
          <!-- Metadata -->
          <div style="background: rgba(99, 116, 255, 0.05); padding: 20px; border-radius: 8px;">
            <h3 style="margin-bottom: 15px; color: #6f7dff;">Metadata</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div>
                <strong>Created:</strong> ${Formatters.formatDate(sim.createdAt)}
              </div>
              <div>
                <strong>Simulation ID:</strong><br/>
                <code style="color: #9aa4ff; word-break: break-all; font-size: 12px;">${sim._id}</code>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Setup close button
      document.getElementById('close-modal').onclick = () => {
        document.body.removeChild(modal);
      };
      
      // Close on overlay click
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      };
      
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading simulation details: ${error.message}`, 'error');
    }
  }
  
  getGhostBehaviorDescription(ghostType) {
    const behaviors = {
      'blinky': 'Direct chaser - Always targets Pacman\'s current position',
      'pinky': 'Ambusher - Targets 4 tiles ahead of Pacman',
      'inky': 'Flanker - Uses vector from Blinky to target ahead of Pacman',
      'clyde': 'Random - Chases when far, scatters when close'
    };
    return behaviors[ghostType] || 'Unknown behavior';
  }
  
  async deleteSimulation(simulationId) {
    if (!confirm('Are you sure you want to delete this simulation?')) {
      return;
    }
    
    try {
      await GameAPI.deleteSimulation(simulationId);
      Formatters.showToast('Simulation deleted successfully', 'success');
      // Reload the results page
      this.loadPage('results');
    } catch (error) {
      Formatters.showToast(`Error deleting simulation: ${error.message}`, 'error');
    }
  }
  
  async promptSaveSimulation(results) {
    const save = confirm(`Simulation complete! ${results.caught ? 'Pacman was caught!' : 'Pacman escaped!'}\n\nDo you want to save this simulation?`);
    
    if (save) {
      const name = prompt('Enter simulation name:');
      if (name) {
        try {
          Formatters.showLoading(true);
          
          // Ensure results are properly structured (deep clone to avoid reference issues)
          const cleanResults = JSON.parse(JSON.stringify(results));
          
          // Add duration if not present
          if (!cleanResults.duration && cleanResults.catchTime) {
            cleanResults.duration = cleanResults.catchTime;
          } else if (!cleanResults.duration) {
            cleanResults.duration = Date.now() - this.simulationViewer.simulationStartTime;
          }
          
          // Ensure trajectoryId is set
          const trajectoryId = this.lastRecordedTrajectory.trajectoryId || 'demo-trajectory';
          
          const simulationData = {
            name,
            trajectoryId: trajectoryId,
            mazeId: this.lastRecordedTrajectory.mazeId,
            ghostConfigs: this.simulationViewer.ghostConfigs.map(config => ({
              type: config.type,
              algorithm: config.algorithm || 'astar',
              startPos: config.startPos
            })),
            results: cleanResults
          };
          
          console.log('Saving simulation:', simulationData);
          
          const response = await GameAPI.saveSimulation(simulationData);
          
          Formatters.showLoading(false);
          Formatters.showToast(`Simulation saved: ${name}`, 'success');
        } catch (error) {
          Formatters.showLoading(false);
          console.error('Error saving simulation:', error);
          Formatters.showToast(`Simulation results recorded but save failed: ${error.message}`, 'info');
        }
      }
    }
  }

  async showClassifyDialog(simulationId) {
    try {
      Formatters.showLoading(true);
      const response = await GameAPI.getAllBatches(1, 100);
      const batches = response.batches || [];
      Formatters.showLoading(false);

      if (batches.length === 0) {
        Formatters.showToast('No batches found. Create a batch first!', 'info');
        return;
      }

      // Create modal dialog
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      `;

      modal.innerHTML = `
        <div style="max-width: 500px; width: 100%; background: rgba(10, 14, 48, 0.98); padding: 30px; border-radius: 16px; border: 1px solid rgba(99, 116, 255, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0;">Classify Simulation to Batch</h3>
            <button id="close-classify-modal" style="background: none; border: none; color: var(--accent-blue); font-size: 24px; cursor: pointer;">×</button>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 10px; color: var(--text-secondary); font-weight: 600;">Select a batch:</label>
            <select id="batch-select" style="width: 100%; padding: 12px; background: rgba(11, 14, 43, 0.85); border: 1px solid rgba(132, 141, 255, 0.25); color: var(--text-primary); border-radius: 8px; font-size: 1rem;">
              ${batches.map(batch => `<option value="${batch._id}">${batch.name}</option>`).join('')}
            </select>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn btn-secondary" id="cancel-classify-btn">Cancel</button>
            <button class="btn btn-primary" id="confirm-classify-btn">Classify</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('close-classify-modal').onclick = () => {
        document.body.removeChild(modal);
      };

      document.getElementById('cancel-classify-btn').onclick = () => {
        document.body.removeChild(modal);
      };

      document.getElementById('confirm-classify-btn').onclick = async () => {
        const batchId = document.getElementById('batch-select').value;
        if (batchId) {
          await this.addSimulationToBatch(batchId, simulationId);
          document.body.removeChild(modal);
        }
      };

      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      };
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error loading batches: ${error.message}`, 'error');
    }
  }

  async addSimulationToBatch(batchId, simulationId) {
    try {
      Formatters.showLoading(true);
      await GameAPI.addSimulationsToBatch(batchId, [simulationId]);
      Formatters.showLoading(false);
      Formatters.showToast('Simulation added to batch', 'success');
    } catch (error) {
      Formatters.showLoading(false);
      Formatters.showToast(`Error adding simulation to batch: ${error.message}`, 'error');
    }
  }
}

// Initialize app
const app = new PacmanLabApp();

