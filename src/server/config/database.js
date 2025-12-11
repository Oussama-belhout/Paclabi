/**
 * MongoDB database configuration and connection
 */

const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pacman-lab';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('⚠️  Running in DEMO MODE without database');
    console.warn('⚠️  Maze generation will work, but data won\'t be saved');
    
    // Don't exit - allow app to run in demo mode
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected - Running in demo mode');
});

mongoose.connection.on('error', (err) => {
  console.warn('⚠️  MongoDB error:', err.message);
});

module.exports = connectDatabase;
