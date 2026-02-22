#!/bin/bash

# Multi-Industry Master ERP Setup Script
# This script sets up the complete Multi-Industry Master ERP system

echo "🚀 Setting up Multi-Industry Master ERP System..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if MongoDB connection is configured
check_mongodb() {
    print_status "Checking MongoDB connection configuration..."
    if [ -z "$MONGO_URI" ]; then
        print_status "Setting up environment variables for MongoDB Atlas..."
        export MONGO_URI="mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack"
        export JWT_SECRET="your_jwt_secret_here_change_in_production"
        export JWT_REFRESH_SECRET="your_jwt_refresh_secret_here_change_in_production"
        export ENCRYPTION_MASTER_KEY="your_encryption_master_key_here_32_chars"
        print_success "Environment variables configured for MongoDB Atlas"
    else
        print_success "MongoDB connection already configured"
    fi
    return 0
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found. Please run this script from the TWS root directory."
        exit 1
    fi
    
    cd backend
    
    print_status "Installing backend dependencies..."
    if npm install; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    print_status "Seeding Master ERP templates..."
    if node src/scripts/seedMasterERPs.js; then
        print_success "Master ERP templates seeded successfully"
    else
        print_error "Failed to seed Master ERP templates"
        exit 1
    fi
    
    print_status "Testing Master ERP system..."
    if node src/scripts/testMasterERP.js; then
        print_success "Master ERP system test passed"
    else
        print_warning "Master ERP system test failed, but continuing..."
    fi
    
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found. Please run this script from the TWS root directory."
        exit 1
    fi
    
    cd frontend
    
    print_status "Installing frontend dependencies..."
    if npm install; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    cd ..
}

# Start services
start_services() {
    print_status "Starting services..."
    
    print_status "Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    print_status "Starting frontend server..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    print_success "Services started successfully!"
    print_status "Backend PID: $BACKEND_PID"
    print_status "Frontend PID: $FRONTEND_PID"
    
    echo ""
    print_status "Access your Multi-Industry Master ERP system:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Backend API: http://localhost:5000"
    print_status "  Supra-Admin: http://localhost:3000/supra-admin"
    print_status "  Master ERP Management: http://localhost:3000/supra-admin/master-erp"
    
    echo ""
    print_status "To stop services, press Ctrl+C"
    
    # Wait for user to stop services
    wait
}

# Main execution
main() {
    echo ""
    print_status "Starting Multi-Industry Master ERP setup..."
    echo ""
    
    # Check MongoDB
    if ! check_mongodb; then
        exit 1
    fi
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    echo ""
    print_success "Multi-Industry Master ERP system setup completed!"
    echo ""
    
    # Ask if user wants to start services
    read -p "Do you want to start the services now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_services
    else
        print_status "Setup complete. To start services manually:"
        print_status "  Backend: cd backend && npm start"
        print_status "  Frontend: cd frontend && npm start"
    fi
}

# Run main function
main
