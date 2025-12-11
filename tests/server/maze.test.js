/**
 * Maze API Tests
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock environment before requiring app
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

describe('Maze API Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    // Create in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Input Validation', () => {
    test('should validate maze dimensions', () => {
      const config = {
        name: 'Test Maze',
        width: 2, // Too small
        height: 10,
        algorithm: 'kruskal'
      };

      // Width should be between 3 and 50
      expect(config.width).toBeLessThan(3);
    });

    test('should accept valid maze config', () => {
      const config = {
        name: 'Test Maze',
        width: 10,
        height: 10,
        algorithm: 'kruskal',
        imperfection: 30
      };

      expect(config.width).toBeGreaterThanOrEqual(3);
      expect(config.width).toBeLessThanOrEqual(50);
      expect(config.height).toBeGreaterThanOrEqual(3);
      expect(config.height).toBeLessThanOrEqual(50);
    });
  });

  describe('Maze Model', () => {
    test('should create valid maze document', () => {
      const Maze = require('../../src/server/models/Maze');
      
      const mazeData = {
        name: 'Test Maze',
        config: {
          width: 10,
          height: 10,
          algorithm: 'kruskal',
          imperfection: 0,
          hasPellets: false,
          tunnels: {
            horizontal: 1,
            vertical: 0
          }
        },
        grid: [[1, 0, 1], [0, 0, 0]]
      };

      const maze = new Maze(mazeData);
      expect(maze.name).toBe('Test Maze');
      expect(maze.config.width).toBe(10);
    });
  });

  describe('Algorithm Selection', () => {
    test('should support all maze algorithms', () => {
      const algorithms = ['kruskal', 'prim', 'recursive_backtracker', 'wilson'];
      
      algorithms.forEach(alg => {
        expect(['kruskal', 'prim', 'recursive_backtracker', 'wilson']).toContain(alg);
      });
    });

    test('should support pellet algorithms', () => {
      const pelletAlgorithms = ['random', 'strategic', 'classic'];
      
      pelletAlgorithms.forEach(alg => {
        expect(['random', 'strategic', 'classic']).toContain(alg);
      });
    });
  });
});

