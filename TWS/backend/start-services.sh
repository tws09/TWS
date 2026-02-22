#!/bin/bash
echo "Starting TWS Backend Services..."

# Start MongoDB (if not running)
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath /var/log/mongodb.log
fi

# Start Redis (if not running)
if ! pgrep -x "redis-server" > /dev/null; then
    echo "Starting Redis..."
    redis-server --daemonize yes
fi

# Start Backend
echo "Starting Backend on port 4000..."
cd "$(dirname "$0")"
npm start &

# Start Admin Dashboard
echo "Starting Admin Dashboard on port 3001..."
cd "../admin-dashboard"
npm start &

echo "All services started!"
