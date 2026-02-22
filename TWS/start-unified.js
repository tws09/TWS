#!/usr/bin/env node

/**
 * Unified Server Startup Script (Using Concurrently)
 * Starts both backend and frontend servers with a single command
 * Uses concurrently for better output management
 */

const { spawn } = require('child_process');
const path = require('path');

// Check if concurrently is available
try {
  require('concurrently');
} catch (error) {
  console.error('❌ Error: concurrently package not found!');
  console.error('   Please run: npm install');
  process.exit(1);
}

// Get project root directory
const projectRoot = __dirname;
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

console.log('');
console.log('========================================');
console.log('   TWS Unified Server Startup');
console.log('========================================');
console.log('');
console.log('🚀 Starting Backend Server (Port 5000)...');
console.log('🚀 Starting Frontend Server (Port 3000)...');
console.log('');
console.log('Press Ctrl+C to stop both servers');
console.log('');

// Determine Node.js executable path
const isWindows = process.platform === 'win32';
const npmExecutable = isWindows ? 'npm.cmd' : 'npm';

// Use concurrently to run both servers
const concurrently = require('concurrently');

const commands = [
  {
    name: 'backend',
    command: `cd backend && node server.js`,
    prefixColor: 'blue',
    cwd: projectRoot
  },
  {
    name: 'frontend',
    command: `cd frontend && ${npmExecutable} start`,
    prefixColor: 'magenta',
    cwd: projectRoot,
    env: {
      BROWSER: 'none' // Prevent auto-opening browser
    }
  }
];

const { result } = concurrently(commands, {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 0,
  restartDelay: 0
});

result.catch((error) => {
  console.error('Error starting servers:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Shutting down servers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

