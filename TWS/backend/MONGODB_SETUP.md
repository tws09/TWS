# MongoDB Setup Guide for Grant All Modules Access Script

## Problem
The script is showing: `connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017`

This means MongoDB is not accessible. You have two options:

## Solution Options

### ✅ Option 1: Use MongoDB Atlas (Cloud - Recommended)

MongoDB Atlas is a cloud-hosted MongoDB service. The script is already configured to use it.

1. **Check if .env file exists**
   - Go to: `backend\.env`
   - If it doesn't exist, create it

2. **Create/Update .env file**
   ```env
   MONGO_URI=mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack
   ```

3. **Verify MongoDB Atlas Access**
   - Make sure you have internet connection
   - Check MongoDB Atlas IP whitelist (should allow your IP or 0.0.0.0/0)
   - Verify the cluster is running in MongoDB Atlas dashboard

4. **Run the script again**
   ```powershell
   cd backend\scripts
   .\run-grant-modules.bat
   ```

### ✅ Option 2: Use Local MongoDB

If you want to use a local MongoDB installation:

1. **Install MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Install MongoDB Community Edition
   - During installation, make sure to install as a service

2. **Start MongoDB Service**
   ```powershell
   # Check if MongoDB service is running
   Get-Service MongoDB
   
   # Start MongoDB service (if not running)
   net start MongoDB
   
   # Or start manually
   mongod --dbpath "C:\data\db"
   ```

3. **Create/Update .env file**
   ```env
   MONGO_URI=mongodb://localhost:27017/tws
   ```

4. **Run the script again**
   ```powershell
   cd backend\scripts
   .\run-grant-modules.bat
   ```

## Quick Fix: Use MongoDB Atlas (Already Configured)

The script is already configured to use MongoDB Atlas. Just make sure:

1. **Create .env file in backend directory:**
   ```
   backend\.env
   ```

2. **Add this line to .env:**
   ```env
   MONGO_URI=mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack
   ```

3. **Run the script:**
   ```powershell
   cd backend\scripts
   .\run-grant-modules.bat
   ```

## Verify MongoDB Connection

### Test MongoDB Atlas Connection
```powershell
# Test connection using Node.js
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack').then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.log('❌ Error:', err.message); process.exit(1); });"
```

### Test Local MongoDB Connection
```powershell
# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/tws').then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.log('❌ Error:', err.message); process.exit(1); });"
```

## Troubleshooting

### Issue: "Authentication failed"
**Solution:** Check MongoDB Atlas username and password in connection string

### Issue: "IP not whitelisted"
**Solution:** 
1. Go to MongoDB Atlas dashboard
2. Network Access → Add IP Address
3. Add your current IP or 0.0.0.0/0 (allow all IPs - less secure)

### Issue: "Connection timeout"
**Solution:**
- Check internet connection
- Verify MongoDB Atlas cluster is running
- Check firewall settings

### Issue: "MongoDB service not found"
**Solution:**
- Install MongoDB locally
- Or use MongoDB Atlas (cloud)

## Recommended: Use MongoDB Atlas

Since the project is already configured for MongoDB Atlas, I recommend using it:

1. **No installation needed** - It's cloud-hosted
2. **Already configured** - Connection string is ready
3. **Accessible from anywhere** - No local setup required
4. **Just create .env file** with the connection string

---

**Quick Start:** Create `backend\.env` with MongoDB Atlas connection string and run the script!

