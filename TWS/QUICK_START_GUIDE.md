# 🚀 EDUCATION SYSTEM - QUICK START GUIDE

**Status:** ✅ All systems running and ready!

---

## 🎯 IMMEDIATE ACCESS URLS

### **Backend API**
- **Health Check:** http://localhost:5000/health
- **Metrics:** http://localhost:5000/metrics
- **Status:** ✅ Running

### **Frontend Application**
- **Main App:** http://localhost:3000
- **Login:** http://localhost:3000/login

### **New Education Portals**

#### **Student Portal** 🎓
- **URL:** `http://localhost:3000/tenant/{tenantSlug}/org/education/students/portal/dashboard`
- **Login:** Use main login with `role: 'student'`
- **Features:** Dashboard, Grades, Attendance, Homework, Timetable, Fees

#### **Principal Portal** 👔
- **URL:** `http://localhost:3000/tenant/{tenantSlug}/org/education/principal/dashboard`
- **Login:** Use main login with `role: 'principal'`
- **Features:** Analytics, Reports, School Management

---

## 🔑 TESTING ACCESS

### **Quick Test Setup**

**Option 1: Using Existing Admin**
1. Login as admin at http://localhost:3000/login
2. Go to User Management
3. Create new users with roles: `student`, `teacher`, `principal`

**Option 2: Database Direct Insert**

```javascript
// Connect to MongoDB
use tws_education

// Create student user
db.users.insertOne({
  email: 'student@test.com',
  password: '$2a$10$...',  // Use bcrypt to hash 'password123'
  role: 'student',
  firstName: 'Test',
  lastName: 'Student',
  tenantId: 'demo',
  orgId: ObjectId('your-org-id'),
  isActive: true,
  createdAt: new Date()
})

// Link to student record
db.students.updateOne(
  { studentId: 'STU-2025-00001' },
  { $set: { userId: ObjectId('user-id-from-above') } }
)

// Create principal user
db.users.insertOne({
  email: 'principal@test.com',
  password: '$2a$10$...',  // Hash 'admin123'
  role: 'principal',
  firstName: 'Test',
  lastName: 'Principal',
  tenantId: 'demo',
  orgId: ObjectId('your-org-id'),
  isActive: true,
  createdAt: new Date()
})
```

---

## 🧪 FEATURE TESTING CHECKLIST

### **Student Portal Tests**

| Feature | URL | Test |
|---------|-----|------|
| Dashboard | `/students/portal/dashboard` | View stats, today's schedule |
| Grades | `/students/portal/grades` | View exam results |
| Attendance | `/students/portal/attendance` | Check attendance % |
| Homework | `/students/portal/homework` | Upload file (max 10MB) |
| Timetable | `/students/portal/timetable` | View weekly schedule |
| Fees | `/students/portal/fees` | Check payment status |

### **Principal Portal Tests**

| Feature | URL | Test |
|---------|-----|------|
| Dashboard | `/principal/dashboard` | View school stats |
| Analytics | `/principal/analytics` | Check enrollment trends |
| Reports | `/principal/reports` | Generate summary |

---

## 🔧 API TESTING (Postman/cURL)

### **1. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "role": "student",
      "email": "student@test.com"
    }
  }
}
```

### **2. Student Dashboard**
```bash
curl -X GET http://localhost:5000/api/tenant/demo/education/student/dashboard \
  -H "Authorization: Bearer <token>"
```

### **3. Principal Analytics**
```bash
curl -X GET http://localhost:5000/api/tenant/demo/education/principal/analytics/students \
  -H "Authorization: Bearer <token>"
```

---

## ⚡ COMMON ISSUES & FIXES

### **Issue: "Module not found" error**
**Fix:** ✅ Already fixed! All dependencies installed.

### **Issue: "Cannot resolve import path"**
**Fix:** ✅ Already fixed! All import paths corrected.

### **Issue: "Port 3000 already in use"**
**Fix:** Press `Y` when prompted to use alternate port, or:
```bash
# Stop process on port 3000
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

### **Issue: "Student portal returns 403"**
**Solution:**
1. Verify user has `role: 'student'`
2. Check Student record has `userId` field
3. Verify token is valid

### **Issue: "File upload fails"**
**Solution:**
1. Check file size (<10MB)
2. Verify file type allowed (PDF, DOC, IMG)
3. Check rate limit (10/hour)

---

## 📊 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│         Frontend (React) - Port 3000            │
├─────────────────────────────────────────────────┤
│  • Student Portal (RBAC protected)              │
│  • Principal Portal (RBAC protected)            │
│  • Teacher Portal (existing)                    │
└────────────────┬────────────────────────────────┘
                 │ JWT Authentication
                 │ Role-based routing
┌────────────────▼────────────────────────────────┐
│         Backend (Express) - Port 5000           │
├─────────────────────────────────────────────────┤
│  Security Layers:                               │
│  1. Input Validation (express-validator)        │
│  2. Rate Limiting (100 req/15min)              │
│  3. RBAC (15+ protected routes)                │
│  4. Security Headers (Helmet)                   │
│  5. Data Isolation (middleware)                │
├─────────────────────────────────────────────────┤
│  Education Routes:                              │
│  • /student/* (9 endpoints)                    │
│  • /principal/* (6 endpoints)                  │
│  • /teachers/* (existing)                      │
└────────────────┬────────────────────────────────┘
                 │
      ┌──────────┴──────────┬──────────┐
      │                     │          │
┌─────▼─────┐    ┌─────────▼────┐   ┌─▼────────┐
│  MongoDB  │    │   AWS S3     │   │  Email   │
│  Database │    │ File Storage │   │ (SMTP)   │
└───────────┘    └──────────────┘   └──────────┘
```

---

## 🎓 EDUCATION ROLES & PERMISSIONS

| Role | Level | Permissions | Portal Access |
|------|-------|-------------|---------------|
| **Principal** | 58 | Full school management | Principal Dashboard |
| **Head Teacher** | 35 | Department management | Teacher Portal+ |
| **Teacher** | 30 | Class management | Teacher Portal |
| **Student** | 10 | View own data only | Student Portal |

---

## 💡 TIPS & BEST PRACTICES

### **For Students:**
1. Submit homework before deadline to avoid "late" flag
2. Check dashboard daily for announcements
3. Monitor attendance percentage (minimum 75%)
4. Download fee receipts for records

### **For Principals:**
5. Review analytics weekly
6. Monitor low attendance alerts
7. Track fee collection trends
8. Generate reports for board meetings

### **For Developers:**
1. Always test RBAC permissions
2. Use rate limits in production
3. Configure S3 for scalability
4. Set up email notifications
5. Monitor error logs
6. Regular security audits

---

## 🌟 SUCCESS INDICATORS

You'll know the system is working when:

✅ Student logs in → sees personal dashboard  
✅ Student uploads homework → file saved to S3  
✅ Principal logs in → sees school statistics  
✅ Grade entry → student receives email  
✅ Data isolation → students can't see others' data  
✅ Rate limits → prevents API abuse  

---

## 📞 SUPPORT

### **If You Need Help:**

1. **Check logs:**
   ```bash
   # Backend logs
   pm2 logs tws-backend
   
   # Or console output if running directly
   ```

2. **Verify configuration:**
   - Check `.env` file
   - Verify MongoDB connection
   - Test health endpoint

3. **Review documentation:**
   - DEPLOYMENT_GUIDE.md
   - IMPLEMENTATION_COMPLETE_SUMMARY.md
   - Inline code comments

---

## 🎉 YOU'RE ALL SET!

The Education System is **READY FOR USE!**

**Start Testing:**
1. Create test users (student, principal)
2. Link users to education records (userId)
3. Login and explore the portals
4. Test all features
5. Deploy to production when ready!

---

**Last Updated:** December 3, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

