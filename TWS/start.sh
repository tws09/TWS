#!/bin/bash

# ========================================
# TWS Unified Server Startup (Single File)
# Starts both backend and frontend servers
# ========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   TWS Unified Server Startup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}[INFO]${NC} Current directory: $(pwd)"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js not found!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Node.js found: $(node --version)"
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} npm not found!"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} npm found: $(npm --version)"
echo ""

# Start servers using Node.js script
echo -e "${BLUE}[INFO]${NC} Starting servers..."
echo ""

node start.js

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERROR]${NC} Failed to start servers"
    exit 1
fi

