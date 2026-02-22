# MongoDB Connection Guide for Tenant Projects Testing

## 🔌 MongoDB Connection Issue

The seed script requires MongoDB to be running. Here's how to resolve this:

---

## ✅ Solution Options

### Option 1: Start MongoDB Service

#### Windows:
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Start MongoDB service
Start-Service MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

#### Check MongoDB Status:
```powershell
# Try connecting
mongosh
# or
mongo
```

### Option 2: Use Existing Database Configuration

The backend likely has MongoDB configuration in:
- `.env` file
- `config/environment.js`
- Environment variables

Check what MongoDB URI the backend uses when running normally.

### Option 3: Update Seed Script with Your MongoDB URI

Edit `seedTenantProjects.js` and set your MongoDB connection:

```javascript
// Option A: Set environment variable
// MONGODB_URI=mongodb://your-host:27017/your-db node src/scripts/seedTenantProjects.js tenantSlug

// Option B: Update script directly (line 26)
const mongoUri = 'mongodb://your-host:27017/your-database-name';
```

---

## 🔍 Find Your MongoDB Configuration

### Check Backend Configuration Files:

1. **Check .env file:**
   ```bash
   cat .env | grep MONGO
   # or
   type .env | findstr MONGO
   ```

2. **Check config/environment.js:**
   - Look for MongoDB connection string
   - May use different variable names

3. **Check when backend starts:**
   - Start backend server normally
   - Check console output for MongoDB connection string
   - Use that same connection string

---

## 🧪 Alternative: Test Without Database

You can test the code structure without MongoDB:

```bash
node src/scripts/testWithoutDB.js
```

This tests:
- ✅ Controller structure
- ✅ Routes configuration
- ✅ Model schemas
- ✅ Code syntax

---

## 💡 Quick Fix for Seed Script

The updated seed script now:
1. Tries to get MongoDB URI from environment
2. Falls back to config/environment.js
3. Shows helpful error messages
4. Provides troubleshooting tips

**Run it again:**
```bash
node src/scripts/seedTenantProjects.js YOUR_TENANT_SLUG
```

---

## 🚀 Testing Without Seed Data

You can still test the endpoints without seeding data:

1. **Start Backend Server:**
   ```bash
   npm start
   ```

2. **Test Endpoints:**
   - Endpoints will return empty arrays if no data exists
   - This is normal and expected
   - Test with POST endpoints to create data

3. **Create Data via API:**
   - Use POST endpoints to create projects, tasks, etc.
   - Then test GET endpoints to retrieve them

---

## ✅ Recommended Approach

1. **Start MongoDB** (if you have it installed)
2. **Start Backend Server** (which will connect to MongoDB)
3. **Test Endpoints** via Postman/curl (create data via API)
4. **Or Run Seed Script** (once MongoDB is running)

---

*The implementation is complete - you just need MongoDB running to test with data!*







