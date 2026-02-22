# Fix Port 4000 Error

## Issue
Frontend is trying to connect to `http://localhost:4000/api/auth/login` instead of using the proxy to port 5000.

## Root Cause
The error shows: `POST http://localhost:4000/api/auth/login net::ERR_CONNECTION_REFUSED`

This means axios is constructing an absolute URL with port 4000, possibly from:
1. Environment variable `REACT_APP_API_URL=http://localhost:4000`
2. Axios default baseURL
3. Cached configuration

## Solution

### Step 1: Check for .env file
Check if there's a `.env` file in the frontend directory:
```bash
cd frontend
cat .env
```

If it exists and has `REACT_APP_API_URL=http://localhost:4000`, either:
- Delete it (to use proxy)
- Or change it to: `REACT_APP_API_URL=http://localhost:5000`

### Step 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Or press `Ctrl+Shift+R`

### Step 3: Restart Frontend Server
```bash
# Stop frontend (Ctrl+C)
# Then restart:
cd frontend
npm start
```

### Step 4: Verify Proxy is Working
The proxy in `setupProxy.js` should forward `/api/*` to `http://localhost:5000`.

Check frontend console for:
```
Proxying request: POST /api/auth/login -> /api/auth/login
```

## Fixed Code

The AuthContext has been updated to:
- ✅ Use relative URL: `/api/auth/login`
- ✅ Explicitly set `baseURL: ''` to prevent axios from using defaults
- ✅ Rely on proxy to forward to port 5000

## Expected Behavior

After fixes:
1. Frontend makes request to: `/api/auth/login` (relative URL)
2. Proxy forwards to: `http://localhost:5000/api/auth/login`
3. Backend processes login
4. Response returned to frontend

## Quick Test

After restarting frontend, check browser console:
- Should see: `🔵 Frontend Login Attempt: { loginUrl: '/api/auth/login', usingProxy: true }`
- Network tab should show request to: `POST /api/auth/login` (not `http://localhost:4000`)

## Summary

1. ✅ Code updated to use relative URL
2. ✅ Explicitly set baseURL to empty string
3. ✅ Proxy configured to forward to port 5000
4. ⚠️ Need to restart frontend to pick up changes
5. ⚠️ Clear browser cache to remove old code

After restarting frontend and clearing cache, login should work!

