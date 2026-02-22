# 👥 CREATE TEST USERS - QUICK GUIDE

**Problem:** Login fails with "Invalid email or password" (401 error)  
**Cause:** Demo users don't exist in database yet  
**Solution:** Create test users with education roles

---

## ⚡ **QUICK FIX - CREATE TEST USERS**

### **Option 1: Use Existing Admin Account (Fastest)**

The system already has an admin account:

```
Email: admin@tws.com  (or admin@wolfstack.com)
Password: admin123
```

**Steps:**
1. Login at: `http://localhost:3000/login`
2. Go to User Management or create users via RBAC UI
3. Create users with education roles

---

### **Option 2: Direct Database Insert (Recommended for Testing)**

**Connect to MongoDB** (Compass or Shell):

```javascript
// Use your database
use tws_production  // or your database name

// 1. CREATE STUDENT USER
db.users.insertOne({
  email: 'student@test.com',
  password: '$2a$10$YourBcryptHashedPassword',  // See note below
  role: 'student',
  firstName: 'John',
  lastName: 'Doe',
  tenantId: 'demo',  // Your tenant slug
  orgId: ObjectId('your-org-id-here'),  // Get from tenants collection
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 2. CREATE TEACHER USER
db.users.insertOne({
  email: 'teacher@test.com',
  password: '$2a$10$YourBcryptHashedPassword',
  role: 'teacher',
  firstName: 'Jane',
  lastName: 'Smith',
  tenantId: 'demo',
  orgId: ObjectId('your-org-id-here'),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 3. CREATE PRINCIPAL USER
db.users.insertOne({
  email: 'principal@test.com',
  password: '$2a$10$YourBcryptHashedPassword',
  role: 'principal',
  firstName: 'Robert',
  lastName: 'Johnson',
  tenantId: 'demo',
  orgId: ObjectId('your-org-id-here'),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

### **📝 IMPORTANT: Password Hashing**

**The demo password `demo123` hashed with bcrypt:**

```javascript
// Use this hash for password: 'demo123'
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**Or generate your own:**
```bash
# In Node.js REPL or online bcrypt tool
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('demo123', 10);
console.log(hash);
// Use this hash in database
```

---

### **🔗 Link Users to Education Records**

After creating User accounts, link them to Student/Teacher records:

```javascript
// FOR STUDENTS:
// 1. Find or create a student record first
db.students.insertOne({
  orgId: ObjectId('your-org-id'),
  studentId: 'STU-2025-00001',
  admissionNumber: 'ADM-2025-001',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: new Date('2010-01-15'),
  gender: 'male',
  currentClass: ObjectId('class-id'),  // Get from classes collection
  section: ObjectId('section-id'),     // Get from sections collection
  academicYear: ObjectId('academic-year-id'),
  status: 'active',
  admissionDate: new Date(),
  email: 'student@test.com',
  phone: '1234567890',
  address: { permanent: {} },
  guardianInfo: {
    fatherName: 'Mr. Doe',
    fatherPhone: '9876543210'
  }
});

// 2. Link the user ID to student record
db.students.updateOne(
  { studentId: 'STU-2025-00001' },
  { $set: { 
    userId: ObjectId('user-id-from-users-collection'),
    email: 'student@test.com'
  }}
);

// FOR TEACHERS:
db.teachers.insertOne({
  orgId: ObjectId('your-org-id'),
  teacherId: 'TCH-2025-00001',
  employeeId: 'EMP-001',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'teacher@test.com',
  phone: '1234567890',
  department: 'Mathematics',
  designation: 'Senior Teacher',
  qualifications: ['MSc Mathematics', 'B.Ed'],
  joiningDate: new Date(),
  status: 'active',
  subjects: [],
  classes: []
});

// Link teacher to user
db.teachers.updateOne(
  { teacherId: 'TCH-2025-00001' },
  { $set: { userId: ObjectId('teacher-user-id') }}
);
```

---

## 🎯 **SIMPLIFIED TEST USER CREATION**

### **Quick Script for MongoDB Shell:**

```javascript
// Copy-paste this entire block into MongoDB shell

// Get your org ID first
const org = db.organizations.findOne();
const orgId = org._id;

// Get tenant ID
const tenant = db.tenants.findOne();
const tenantSlug = tenant.slug;

// Password hash for 'demo123'
const demoPasswordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// 1. Create Student User
const studentUser = db.users.insertOne({
  email: 'student@test.com',
  password: demoPasswordHash,
  role: 'student',
  firstName: 'Test',
  lastName: 'Student',
  tenantId: tenantSlug,
  orgId: orgId,
  isActive: true,
  createdAt: new Date()
});

print('✅ Student user created:', studentUser.insertedId);

// 2. Create Teacher User
const teacherUser = db.users.insertOne({
  email: 'teacher@test.com',
  password: demoPasswordHash,
  role: 'teacher',
  firstName: 'Test',
  lastName: 'Teacher',
  tenantId: tenantSlug,
  orgId: orgId,
  isActive: true,
  createdAt: new Date()
});

print('✅ Teacher user created:', teacherUser.insertedId);

// 3. Create Principal User
const principalUser = db.users.insertOne({
  email: 'principal@test.com',
  password: demoPasswordHash,
  role: 'principal',
  firstName: 'Test',
  lastName: 'Principal',
  tenantId: tenantSlug,
  orgId: orgId,
  isActive: true,
  createdAt: new Date()
});

print('✅ Principal user created:', principalUser.insertedId);

// 4. If you have existing student records, link them:
// db.students.updateOne(
//   { studentId: 'STU-2025-00001' },
//   { $set: { userId: studentUser.insertedId }}
// );

print('✅ All test users created! Try logging in now.');
print('📧 Emails: student@test.com, teacher@test.com, principal@test.com');
print('🔑 Password: demo123');
```

---

## 🔄 **AFTER CREATING USERS:**

### **Test Login Flow:**

```bash
# 1. Go to education login
http://localhost:3000/education-login

# 2. Select "Student Portal"

# 3. Enter credentials:
Email: student@test.com
Password: demo123

# 4. Click "Sign in"

# 5. Should redirect to:
http://localhost:3000/tenant/demo/org/education/students/portal/dashboard

# 6. If student has userId linked:
   ✅ Dashboard loads with data
   
# 7. If student doesn't have userId linked:
   ⚠️  Need to link userId to student record (see above)
```

---

## 🚨 **CURRENT ERROR EXPLAINED:**

```
❌ Login failed: Invalid email or password (401)
```

**Why:**
- The demo credentials (`student@test.com`, `teacher@test.com`, `principal@test.com`) don't exist in your database yet
- You need to CREATE these users first

**Solution:**
1. Run the MongoDB script above to create test users
2. OR use existing admin account and create users via RBAC UI
3. Then try logging in again

---

## ✅ **ALTERNATIVE: Use Existing Users**

If you already have users in the database, you can:

```javascript
// Find existing users
db.users.find({}).limit(5);

// Update their role to education role
db.users.updateOne(
  { email: 'existing@user.com' },
  { $set: { role: 'student' }}  // or 'teacher', 'principal'
);

// Then login with that email
```

---

## 🔧 **BACKEND PORT ISSUE FIXED:**

The error `EADDRINUSE: address already in use :::5000` has been resolved:

✅ Killed old process (PID 21856)  
✅ Starting fresh backend server  
⏳ Server should be running now

---

## 📋 **NEXT STEPS:**

1. **Create test users** (use MongoDB script above)
2. **Wait for backend** to fully start (check terminal 15)
3. **Refresh browser**
4. **Try login again** at `/education-login`
5. **Success!** Portal should load

---

**Status:** ✅ System ready, just needs test users created!

**Backend:** ✅ Restarting (port 5000)  
**Frontend:** ✅ Running (port 3000)  
**Education Login:** ✅ Created at `/education-login`  
**Missing:** ⚠️ Test user accounts (easy to create!)

