# Industry-Specific Signup Forms Implementation (Option 2)

## ✅ Implementation Complete

This document describes the implementation of **Option 2: Completely Separate Flows** for industry-specific signup forms.

---

## 🎯 Approach

**Separate flows for each ERP category** with different steps and fields:
- **Education**: 5 steps (includes school-specific fields)
- **Healthcare**: 4 steps (includes facility details)
- **Manufacturing**: 4 steps (includes production details)
- **Retail**: 4 steps (includes store setup)
- **Software House**: 4 steps (includes tech stack)
- **Warehouse**: 4 steps (includes warehouse details)
- **Business**: 3 steps (minimal, generic)

---

## 📁 Files Created

### 1. `signup-flows.js` - Flow Definitions
**Location**: `TWS/erp-pages/signup-flows.js`

Contains flow configurations for each industry:
- Step definitions with fields
- Field types (text, email, select, otp, slug, etc.)
- Field validation rules
- Industry-specific options

**Example Structure:**
```javascript
education: {
  steps: [
    { id: 1, title: 'Create Your Account', fields: [...] },
    { id: 2, title: 'Verify Your Email', fields: [...] },
    { id: 3, title: 'School Information', fields: [...] },
    { id: 4, title: 'Set Up Your Tenant', fields: [...] },
    { id: 5, title: 'Welcome!', type: 'confirmation' }
  ]
}
```

### 2. `signup-modal-v2.js` - Dynamic Modal Generator
**Location**: `TWS/erp-pages/signup-modal-v2.js`

- Dynamically generates modal HTML based on flow configuration
- Handles form submission for each step
- Industry-specific data mapping
- Real-time validation (password strength, slug availability)

**Key Features:**
- Auto-detects industry from URL
- Generates forms dynamically from flow definitions
- Handles industry-specific field mappings
- Progress tracking based on number of steps

---

## 🔄 Industry-Specific Flows

### Education (5 Steps)
1. **Create Account**: Admin First Name, Last Name, Email, Password
2. **Verify Email**: OTP verification
3. **School Information**: School Name, School Type (K-12/College/University), School Email, School Phone
4. **Set Up Tenant**: Slug selection
5. **Confirmation**: Welcome screen

### Healthcare (4 Steps)
1. **Create Account**: Full Name, Email, Password
2. **Verify Email**: OTP verification
3. **Facility Details**: Facility Name, Facility Type (Hospital/Clinic/Medical Center/Pharmacy), License Number, Contact Phone, Slug
4. **Confirmation**: Welcome screen

### Manufacturing (4 Steps)
1. **Create Account**: Full Name, Email, Password
2. **Verify Email**: OTP verification
3. **Company Details**: Company Name, Industry Sub-type (Automotive/Electronics/Textiles/etc.), Employee Count, Manufacturing Type (Discrete/Process/Mixed), Slug
4. **Confirmation**: Welcome screen

### Retail (4 Steps)
1. **Create Account**: Full Name, Email, Password
2. **Verify Email**: OTP verification
3. **Store Details**: Store Name, Store Type (Single Store/Chain/E-commerce/Hybrid), Location Count, Primary Category, Slug
4. **Confirmation**: Welcome screen

### Software House (4 Steps)
1. **Create Account**: Full Name, Email, Password
2. **Verify Email**: OTP verification
3. **Company Details**: Company Name, Team Size, Primary Tech Stack, Development Methodology, Slug
4. **Confirmation**: Welcome screen

### Warehouse (4 Steps)
1. **Create Account**: Full Name, Email, Password
2. **Verify Email**: OTP verification
3. **Warehouse Details**: Warehouse Name, Warehouse Type, Square Footage, Slug
4. **Confirmation**: Welcome screen

### Business (3 Steps - Minimal)
1. **Create Account**: Full Name, Email, Password
2. **Verify Email**: OTP verification
3. **Organization Setup**: Organization Name, Slug

---

## 🔧 Backend Updates

### Enhanced `selfServeSignupService.js`
- Accepts industry-specific metadata
- Maps metadata to tenant configuration:
  - **Education**: Sets `educationConfig` with institution type
  - **Software House**: Sets `softwareHouseConfig` with methodology and tech stack
  - **All Industries**: Stores metadata in tenant record

### Updated API Route
- `/api/signup/create-tenant` now accepts `metadata` object
- Metadata contains industry-specific fields
- Backend maps metadata to appropriate tenant fields

---

## 📊 Data Flow

```
1. User clicks "Start Free Trial" on landing page
   ↓
2. Modal detects industry from URL
   ↓
3. Loads industry-specific flow from signup-flows.js
   ↓
4. Generates form dynamically based on flow steps
   ↓
5. User fills form (industry-specific fields)
   ↓
6. On submit, maps data to backend format
   ↓
7. Backend stores industry-specific data in:
   - Tenant.educationConfig (for education)
   - Tenant.softwareHouseConfig (for software house)
   - Tenant.metadata.industrySpecificData (for all)
   ↓
8. Tenant provisioned with industry-specific modules
```

---

## 🎨 Customization Guide

### Adding a New Industry Flow

1. **Add flow definition** to `signup-flows.js`:
```javascript
new_industry: {
  steps: [
    {
      id: 1,
      title: 'Step Title',
      subtitle: 'Step subtitle',
      fields: [
        { name: 'fieldName', label: 'Field Label', type: 'text', required: true }
      ]
    }
  ]
}
```

2. **Update industry detection** in `signup-modal-v2.js`:
```javascript
getIndustryFromURL() {
  // Add: if (path.includes('new-industry')) return 'new_industry';
}
```

3. **Update backend mapping** in `signup-modal-v2.js`:
```javascript
async handleTenantCreation(data) {
  // Add mapping for new industry
  if (this.industry === 'new_industry') {
    tenantData.organizationName = data.companyName;
    tenantData.metadata = { ... };
  }
}
```

### Modifying Existing Flow

Simply edit the flow definition in `signup-flows.js`:
- Add/remove steps
- Add/remove fields
- Change field types
- Update options for select fields

**No code changes needed** - the modal automatically adapts!

---

## ✅ Benefits of This Approach

1. **Easy Customization**: Just edit flow definitions, no code changes
2. **Industry-Specific Data**: Collect relevant data per industry
3. **Flexible Steps**: Different number of steps per industry
4. **Maintainable**: One codebase, multiple flows
5. **Extensible**: Easy to add new industries
6. **Better UX**: Users see relevant fields for their industry

---

## 🔄 Migration from Old Modal

The old `signup-modal.js` is still available but deprecated. To migrate:

1. Replace script includes:
   ```html
   <!-- Old -->
   <script src="signup-modal.js"></script>
   
   <!-- New -->
   <script src="signup-flows.js"></script>
   <script src="signup-modal-v2.js"></script>
   ```

2. No other changes needed - same API endpoints, same button triggers

---

## 📝 Example: Education Flow Fields

```javascript
// Step 1: Create Account
- adminFirstName (text, required)
- adminLastName (text, required)
- adminEmail (email, required)
- adminPassword (password, required, showStrength: true)
- confirmPassword (password, required)

// Step 2: Verify Email
- otp (otp, required, length: 6)

// Step 3: School Information
- schoolName (text, required)
- schoolType (select, required)
  - K-12 School
  - College
  - University
- schoolEmail (email, optional)
- schoolPhone (tel, optional)

// Step 4: Set Up Tenant
- slug (slug, required, checkAvailability: true)
- industry (hidden, value: 'education')

// Step 5: Confirmation
- (confirmation screen)
```

---

## 🚀 Next Steps

1. **Test each industry flow** end-to-end
2. **Add more industry-specific fields** as needed
3. **Customize onboarding checklist** per industry
4. **Add industry-specific validation** rules
5. **Create industry-specific welcome emails**

---

## 📚 Files Summary

| File | Purpose |
|------|---------|
| `signup-flows.js` | Flow definitions for all industries |
| `signup-modal-v2.js` | Dynamic modal generator |
| `signup-modal.js` | Old generic modal (deprecated) |
| `selfServeSignupService.js` | Backend service (enhanced) |
| `selfServeSignup.js` | API routes (enhanced) |

---

**Status**: ✅ **Implementation Complete**

All industry-specific flows are implemented and ready for testing!
