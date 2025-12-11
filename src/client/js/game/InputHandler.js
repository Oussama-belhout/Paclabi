/**
 * Input Handler for Pacman Controls
 */

class InputHandler {
  constructor(onDirectionChange) {
    this.onDirectionChange = onDirectionChange;
    this.currentDirection = 'RIGHT';
    this.queuedDirection = null;
    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener('keydown', (e) => {
      const key = e.key;
      let newDirection = null;

      switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newDirection = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newDirection = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newDirection = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newDirection = 'RIGHT';
          break;
      }

      if (newDirection) {
        e.preventDefault();
        this.queuedDirection = newDirection;
        
        if (this.onDirectionChange) {
          this.onDirectionChange(newDirection);
        }
      }
    });
  }

  setDirection(direction) {
    this.currentDirection = direction;
  }

  getDirection() {
    return this.currentDirection;
  }

  getQueuedDirection() {
    const queued = this.queuedDirection;
    this.queuedDirection = null;
    return queued;
  }
}

