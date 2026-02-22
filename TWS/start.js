#!/usr/bin/env node

/**
 * Unified Server Startup Script
 * Starts both backend and frontend servers with a single command
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get project root directory
const projectRoot = __dirname;
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

// Check if directories exist
if (!fs.existsSync(backendDir)) {
  log('❌ Backend directory not found!', 'red');
  process.exit(1);
}

if (!fs.existsSync(frontendDir)) {
  log('❌ Frontend directory not found!', 'red');
  process.exit(1);
}

// Check if node_modules exist
const backendNodeModules = path.join(backendDir, 'node_modules');
const frontendNodeModules = path.join(frontendDir, 'node_modules');

if (!fs.existsSync(backendNodeModules)) {
  log('⚠️  Backend node_modules not found. Installing dependencies...', 'yellow');
  log('   Run: cd backend && npm install', 'yellow');
}

if (!fs.existsSync(frontendNodeModules)) {
  log('⚠️  Frontend node_modules not found. Installing dependencies...', 'yellow');
  log('   Run: cd frontend && npm install', 'yellow');
}

log('', 'reset');
log('========================================', 'cyan');
log('   TWS Unified Server Startup', 'cyan');
log('========================================', 'cyan');
log('', 'reset');

// Determine Node.js executable path
const isWindows = process.platform === 'win32';
const nodeExecutable = isWindows 
  ? process.execPath || 'node.exe'
  : 'node';

const npmExecutable = isWindows ? 'npm.cmd' : 'npm';

// Store process references for cleanup
let backendProcess = null;
let frontendProcess = null;

// Function to start backend server
function startBackend() {
  log('🚀 Starting Backend Server (Port 5000)...', 'blue');
  
  // Fix deprecation warning: Don't use shell option with arguments
  // On Windows, use nodeExecutable directly; on Unix, use nodeExecutable
  const backendProcess = spawn(nodeExecutable, ['server.js'], {
    cwd: backendDir,
    stdio: 'pipe', // Use pipe to capture output
    shell: false, // Don't use shell to avoid deprecation warning
    env: {
      ...process.env,
      FORCE_COLOR: '1'
    }
  });

  // Handle backend output
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    // Filter out Redis errors if Redis is disabled
    if (output.includes('ECONNREFUSED') && output.includes('6379')) {
      return; // Suppress Redis connection errors
    }
    process.stdout.write(`[Backend] ${output}`);
  });

  backendProcess.stderr.on('data', (data) => {
    const output = data.toString();
    // Filter out Redis errors if Redis is disabled
    if (output.includes('ECONNREFUSED') && output.includes('6379')) {
      return; // Suppress Redis connection errors
    }
    process.stderr.write(`[Backend] ${output}`);
  });

  backendProcess.on('error', (error) => {
    log(`❌ Backend server error: ${error.message}`, 'red');
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`❌ Backend server exited with code ${code}`, 'red');
    }
  });

  return backendProcess;
}

// Function to start frontend server
function startFrontend() {
  log('🚀 Starting Frontend Server (Port 3000)...', 'blue');
  
  // Use react-scripts start for Create React App
  // On Windows, npm.cmd needs shell, but we'll handle it properly
  const frontendProcess = spawn(npmExecutable, ['start'], {
    cwd: frontendDir,
    stdio: 'pipe', // Use pipe to capture output
    shell: isWindows, // npm.cmd requires shell on Windows
    env: {
      ...process.env,
      FORCE_COLOR: '1',
      BROWSER: 'none', // Prevent auto-opening browser
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
    }
  });

  // Handle frontend output
  frontendProcess.stdout.on('data', (data) => {
    process.stdout.write(`[Frontend] ${data}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    process.stderr.write(`[Frontend] ${data}`);
  });

  frontendProcess.on('error', (error) => {
    log(`❌ Frontend server error: ${error.message}`, 'red');
  });

  frontendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`❌ Frontend server exited with code ${code}`, 'red');
    }
  });

  return frontendProcess;
}

// Start both servers
log('📦 Starting servers...', 'cyan');
log('', 'reset');

backendProcess = startBackend();
frontendProcess = startFrontend();

// Wait a bit for servers to start
setTimeout(() => {
  log('', 'reset');
  log('========================================', 'green');
  log('   Servers Starting...', 'green');
  log('========================================', 'green');
  log('', 'reset');
  log('✅ Backend Server: http://localhost:5000', 'green');
  log('✅ Frontend Server: http://localhost:3000', 'green');
  log('✅ Health Check: http://localhost:5000/health', 'green');
  log('', 'reset');
  log('📋 Access URLs:', 'cyan');
  log('   - Frontend: http://localhost:3000', 'cyan');
  log('   - Backend API: http://localhost:5000', 'cyan');
  log('   - Supra Admin: http://localhost:3000/supra-admin-login', 'cyan');
  log('', 'reset');
  log('💡 Press Ctrl+C to stop all servers', 'yellow');
  log('', 'reset');
}, 3000);

// Handle graceful shutdown
let isShuttingDown = false;

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log('', 'reset');
  log('🛑 Shutting down servers...', 'yellow');
  
  const killProcess = (proc, name) => {
    if (proc && !proc.killed) {
      try {
        if (isWindows) {
          // On Windows, use taskkill for more reliable process termination
          spawn('taskkill', ['/F', '/T', '/PID', proc.pid.toString()], {
            stdio: 'ignore',
            shell: true
          });
        } else {
          proc.kill('SIGTERM');
        }
      } catch (error) {
        // Ignore errors during shutdown
      }
    }
  };

  killProcess(backendProcess, 'Backend');
  killProcess(frontendProcess, 'Frontend');
  
  setTimeout(() => {
    log('✅ Servers stopped', 'green');
    process.exit(0);
  }, 2000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle process exit
process.on('exit', () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill();
  }
});

