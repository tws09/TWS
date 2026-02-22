@echo off
echo Starting TWS Backend Server...

REM Set environment variables
set PORT=5000
set NODE_ENV=development
set MONGO_URI=mongodb://localhost:27017/tws_database
set JWT_SECRET=tws_jwt_secret_key_2025_super_secure_random_string_for_development
set JWT_REFRESH_SECRET=tws_refresh_secret_key_2025_super_secure_random_string_for_development
set ENCRYPTION_MASTER_KEY=tws_encryption_master_key_2025_super_secure_random_string_for_development
set BASE_URL=http://localhost:3000
set SOCKET_CORS_ORIGIN=http://localhost:3000
set LOG_LEVEL=info
set ENCRYPTION_ENABLED=true
set AUDIT_LOGGING_ENABLED=true
set RBAC_ENABLED=true
set MONITORING_ENABLED=true
set METRICS_ENABLED=true

echo Environment variables set
echo Starting server on port %PORT%...

node server.js
