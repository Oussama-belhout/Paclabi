/**
 * Python Bridge Service
 * Handles execution of Python algorithms from Node.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

class PythonBridge {
  constructor() {
    this.pythonPath = config.PYTHON_PATH;
    this.algorithmPath = path.join(__dirname, '..', '..', 'algorithms');
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Execute Python script with arguments
   */
  async executeScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const fullPath = path.join(this.algorithmPath, scriptPath);
      
      if (!fs.existsSync(fullPath)) {
        reject(new Error(`Python script not found: ${fullPath}`));
        return;
      }

      const pythonProcess = spawn(this.pythonPath, [fullPath, ...args]);
      
      let stdout = '';
      let stderr = '';

      const timeoutId = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python script execution timeout'));
      }, this.timeout);

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      pythonProcess.on('close', (code) => {
        clearTimeout(timeoutId);

        if (code !== 0) {
          reject(new Error(`Python script failed (code ${code}): ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e.message}\nOutput: ${stdout}`));
        }
      });
    });
  }

  /**
   * Generate a maze
   */
  async generateMaze(width, height, algorithm = 'kruskal', imperfection = 0, tunnelsH = 1, tunnelsV = 0) {
    const args = [
      'generate',
      String(width),
      String(height),
      '--algorithm', algorithm,
      '--imperfection', String(imperfection),
      '--tunnels-h', String(tunnelsH),
      '--tunnels-v', String(tunnelsV)
    ];

    const result = await this.executeScript('main.py', args);
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  }

  /**
   * Place pellets on a maze grid
   */
  async placePellets(grid, algorithm = 'strategic', options = {}) {
    const gridJson = JSON.stringify(grid);
    const args = [
      'pellets',
      '--grid-json', gridJson,
      '--algorithm', algorithm
    ];

    if (options.density !== undefined) {
      args.push('--density', String(options.density));
    }
    if (options.corridorDensity !== undefined) {
      args.push('--corridor-density', String(options.corridorDensity));
    }
    if (options.junctionDensity !== undefined) {
      args.push('--junction-density', String(options.junctionDensity));
    }

    const result = await this.executeScript('main.py', args);
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  }

  /**
   * Simulate a game with ghosts
   */
  async simulateGame(trajectoryFile, gridFile, ghostConfigs) {
    const args = [
      'simulate',
      '--trajectory-file', trajectoryFile,
      '--grid-file', gridFile,
      '--ghost-configs', JSON.stringify(ghostConfigs)
    ];

    const result = await this.executeScript('main.py', args);
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  }
}

// Export singleton instance
module.exports = new PythonBridge();

