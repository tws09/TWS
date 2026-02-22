#!/bin/bash

# TWS Portal Startup Script
# This script starts the TWS Project Portal in development mode

set -e

echo "🚀 Starting TWS Project Portal..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if MongoDB is running
check_mongodb() {
    if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
        print_warning "MongoDB client not found. Make sure MongoDB is accessible."
    fi
    
    print_status "MongoDB connection will be tested during startup"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    print_success "Dependencies installed"
}

# Run database migration
run_migration() {
    print_status "Running Portal database migration..."
    
    if [ -d "backend" ]; then
        cd backend
        npm run migrate:portal
        cd ..
        print_success "Database migration completed"
    else
        print_warning "Backend directory not found, skipping migration"
    fi
}

# Start development servers
start_servers() {
    print_status "Starting development servers..."
    
    # Check if concurrently is installed
    if ! command -v concurrently &> /dev/null; then
        print_status "Installing concurrently globally..."
        npm install -g concurrently
    fi
    
    # Start both backend and frontend
    print_status "Starting Portal Backend (port 4000) and Frontend (port 3000)..."
    
    concurrently \
        --names "BACKEND,FRONTEND" \
        --prefix-colors "blue,green" \
        "cd backend && npm run dev" \
        "cd frontend && npm start"
}

# Main function
main() {
    print_status "Starting TWS Portal development environment..."
    
    check_node
    check_mongodb
    install_dependencies
    
    # Ask if user wants to run migration
    read -p "Do you want to run the Portal migration? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_migration
    fi
    
    print_status "Starting development servers..."
    print_status "Portal will be available at:"
    print_status "  Frontend: http://localhost:3000/portal"
    print_status "  Backend:  http://localhost:4000/api/portal"
    print_status ""
    print_status "Press Ctrl+C to stop all servers"
    print_status ""
    
    start_servers
}

# Handle script arguments
case "${1:-}" in
    "install")
        check_node
        install_dependencies
        ;;
    "migrate")
        run_migration
        ;;
    "backend")
        print_status "Starting Portal Backend only..."
        cd backend && npm run dev
        ;;
    "frontend")
        print_status "Starting Portal Frontend only..."
        cd frontend && npm start
        ;;
    *)
        main
        ;;
esac
