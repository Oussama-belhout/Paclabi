/**
 * Configuration Panel Component
 */

class ConfigPanel {
  static createMazeConfig() {
    return `
      <div class="config-panel">
        <div class="config-row">
          <div class="form-group">
            <label for="mazeName">Maze Name</label>
            <input type="text" id="mazeName" class="form-control" placeholder="My Awesome Maze" required>
          </div>
          
          <div class="form-group">
            <label for="width">Width (3-50)</label>
            <input type="number" id="width" class="form-control" value="24" min="3" max="50" required>
          </div>
          
          <div class="form-group">
            <label for="height">Height (3-50)</label>
            <input type="number" id="height" class="form-control" value="15" min="3" max="50" required>
          </div>
        </div>

        <div class="config-row">
          <div class="form-group">
            <label for="algorithm">Generation Algorithm</label>
            <select id="algorithm" class="form-control">
              <option value="kruskal">Kruskal's (Random)</option>
              <option value="prim">Prim's (Organic)</option>
              <option value="recursive_backtracker">Recursive Backtracker (Long Corridors)</option>
              <option value="wilson">Wilson's (Unbiased)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="imperfection">Imperfection Level (%)</label>
            <input type="number" id="imperfection" class="form-control" value="30" min="0" max="100">
          </div>
        </div>

        <div class="config-row">
          <div class="form-group">
            <label for="tunnelsH">Horizontal Tunnels</label>
            <input type="number" id="tunnelsH" class="form-control" value="1" min="0" max="10">
          </div>
          
          <div class="form-group">
            <label for="tunnelsV">Vertical Tunnels</label>
            <input type="number" id="tunnelsV" class="form-control" value="0" min="0" max="10">
          </div>
        </div>

        <div class="config-row">
          <div class="form-group">
            <label>
              <input type="checkbox" id="hasPellets" checked>
              Include Pellets
            </label>
          </div>
          
          <div class="form-group">
            <label for="pelletAlgorithm">Pellet Placement</label>
            <select id="pelletAlgorithm" class="form-control">
              <option value="strategic">Strategic</option>
              <option value="random">Random</option>
              <option value="classic">Classic Pac-Man</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  static getMazeConfigValues() {
    return {
      name: document.getElementById('mazeName').value,
      width: parseInt(document.getElementById('width').value),
      height: parseInt(document.getElementById('height').value),
      algorithm: document.getElementById('algorithm').value,
      imperfection: parseInt(document.getElementById('imperfection').value),
      tunnelsH: parseInt(document.getElementById('tunnelsH').value),
      tunnelsV: parseInt(document.getElementById('tunnelsV').value),
      hasPellets: document.getElementById('hasPellets').checked,
      pelletAlgorithm: document.getElementById('pelletAlgorithm').value
    };
  }

  static createGhostConfig(index = 0) {
    const ghostTypes = [
      { value: 'blinky', label: 'Blinky (Red) - Chaser', icon: '👻' },
      { value: 'pinky', label: 'Pinky (Pink) - Ambusher', icon: '👻' },
      { value: 'inky', label: 'Inky (Cyan) - Flanker', icon: '👻' },
      { value: 'clyde', label: 'Clyde (Orange) - Random', icon: '👻' }
    ];

    return `
      <div class="ghost-config-item" data-ghost-index="${index}">
        <div class="ghost-icon">${ghostTypes[index % 4].icon}</div>
        
        <div class="form-group">
          <label>Ghost Type</label>
          <select class="form-control ghost-type">
            ${ghostTypes.map((type, i) => `
              <option value="${type.value}" ${i === index % 4 ? 'selected' : ''}>
                ${type.label}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Algorithm</label>
          <select class="form-control ghost-algorithm">
            <option value="astar">A* (Optimal)</option>
            <option value="bfs">BFS (Simple)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Start Y</label>
          <input type="number" class="form-control ghost-start-y" value="${1 + index}" min="0">
        </div>
        
        <div class="form-group">
          <label>Start X</label>
          <input type="number" class="form-control ghost-start-x" value="${1 + index * 2}" min="0">
        </div>
      </div>
    `;
  }

  static getGhostConfigValues() {
    const ghostItems = document.querySelectorAll('.ghost-config-item');
    const configs = [];

    ghostItems.forEach(item => {
      configs.push({
        type: item.querySelector('.ghost-type').value,
        algorithm: item.querySelector('.ghost-algorithm').value,
        startPos: {
          y: parseInt(item.querySelector('.ghost-start-y').value),
          x: parseInt(item.querySelector('.ghost-start-x').value)
        }
      });
    });

    return configs;
  }
}

