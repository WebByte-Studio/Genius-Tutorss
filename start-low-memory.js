#!/usr/bin/env node

// Memory-efficient startup script for cPanel shared hosting
// This script starts the application with minimal memory usage

// Set memory limits before loading any modules
process.env.NODE_OPTIONS = '--max-old-space-size=512 --optimize-for-size';

// Memory monitoring
const startMemory = process.memoryUsage();
console.log(`Starting with memory - RSS: ${Math.round(startMemory.rss / 1024 / 1024)}MB`);

// Load the main server
try {
  require('./server.js');
} catch (error) {
  console.error('Failed to start server:', error.message);
  console.error('Memory usage at failure:', process.memoryUsage());
  process.exit(1);
}
