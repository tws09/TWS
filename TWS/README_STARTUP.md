# 🚀 Quick Start - Start Both Servers

## The Easiest Way

Just run this **one command**:

```bash
npm start
```

That's it! Both servers will start automatically.

## What Gets Started

✅ **Backend Server** - Port 5000
✅ **Frontend Server** - Port 3000

## Alternative Methods

### Windows
```bash
# Method 1: Using npm (recommended)
npm start

# Method 2: Using batch file
start.bat

# Method 3: Using Node.js
node start.js
```

### Linux/Mac
```bash
# Method 1: Using npm (recommended)
npm start

# Method 2: Using shell script
chmod +x start.sh
./start.sh

# Method 3: Using Node.js
node start.js
```

## Stopping Servers

Press `Ctrl+C` to stop both servers.

## Access URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## Files Created

- ✅ `start.js` - Main startup script (Node.js)
- ✅ `start.bat` - Windows batch file
- ✅ `start.sh` - Linux/Mac shell script
- ✅ `package.json` - Updated with "start" script

## How It Works

The `start.js` script:
1. Checks for Node.js and dependencies
2. Starts backend server in background
3. Starts frontend server in background
4. Shows combined output from both servers
5. Handles graceful shutdown (Ctrl+C stops both)

## Requirements

- Node.js installed
- Dependencies installed (`npm run install:all`)
- MongoDB running (or MongoDB Atlas connection)

## Troubleshooting

### Port Already in Use

If ports 3000 or 5000 are already in use:

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F

netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :5000
kill -9 <PID>

lsof -i :3000
kill -9 <PID>
```

### Dependencies Not Installed

```bash
npm run install:all
```

---

**That's it! Just run `npm start` and you're good to go!** 🎉

