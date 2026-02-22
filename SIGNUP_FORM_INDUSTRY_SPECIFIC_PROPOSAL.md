# Industry-Specific Signup Forms - Enhancement Proposal

## Current State Analysis

### ✅ What Exists Now

1. **Generic Self-Serve Signup** (`signup-modal.js`)
   - Same form for all industries
   - Only difference: Industry dropdown pre-populated
   - Fields: Name, Email, Password, Organization Name, Slug

2. **Education-Specific Signup** (`/api/education/signup`)
   - Separate endpoint with education-specific fields
   - Fields: School Name, School Email, Admin Details

---

## 🎯 Proposed Enhancement: Industry-Specific Forms

### Option 1: Conditional Fields Based on Industry (Recommended)

**Same flow, different fields in Step 3:**

```javascript
// Step 3 would show different fields based on industry:

// Education:
- School Name
- School Type (K-12, College, University)
- School Email
- School Phone
- Admin First Name
- Admin Last Name

// Healthcare:
- Hospital/Clinic Name
- Facility Type (Hospital, Clinic, Medical Center)
- License Number
- Contact Email
- Contact Phone

// Manufacturing:
- Company Name
- Industry Sub-type (Automotive, Electronics, Textiles, etc.)
- Number of Employees
- Manufacturing Type (Discrete, Process, Mixed)

// Retail:
- Store Name
- Store Type (Single Store, Chain, E-commerce)
- Number of Locations
- Primary Product Category

// Software House:
- Company Name
- Team Size
- Primary Tech Stack
- Development Methodology Preference
```

### Option 2: Completely Separate Flows

**Different number of steps per industry:**

- **Education**: 5 steps (includes school setup)
- **Healthcare**: 4 steps (includes compliance info)
- **Manufacturing**: 4 steps (includes production details)
- **Retail**: 4 steps (includes store setup)
- **Generic**: 3 steps (minimal)

---

## 📋 Implementation Plan

### Phase 1: Add Industry-Specific Fields to Step 3

1. **Update `signup-modal.js`**:
   ```javascript
   // Add method to get industry-specific fields
   getIndustryFields(industry) {
     const fieldSets = {
       education: [
         { name: 'schoolName', label: 'School Name', required: true },
         { name: 'schoolType', label: 'School Type', type: 'select', options: ['K-12', 'College', 'University'] },
         { name: 'schoolEmail', label: 'School Email', type: 'email' },
         { name: 'schoolPhone', label: 'School Phone', type: 'tel' }
       ],
       healthcare: [
         { name: 'facilityName', label: 'Hospital/Clinic Name', required: true },
         { name: 'facilityType', label: 'Facility Type', type: 'select', options: ['Hospital', 'Clinic', 'Medical Center'] },
         { name: 'licenseNumber', label: 'License Number' }
       ],
       // ... etc
     };
     return fieldSets[industry] || [];
   }
   ```

2. **Update Backend API**:
   - Accept industry-specific fields in `/api/signup/create-tenant`
   - Store in tenant metadata or specific fields

### Phase 2: Industry-Specific Validation

- **Education**: Validate school email domain
- **Healthcare**: Validate license numbers (if applicable)
- **Manufacturing**: Validate company size ranges
- **Retail**: Validate store types

### Phase 3: Industry-Specific Onboarding

- Different checklist items per industry
- Industry-specific welcome emails
- Industry-specific default data seeding

---

## 🔄 Recommended Approach

**Hybrid Approach**: 
- Keep same 4-step flow for consistency
- Add conditional fields in Step 3 based on industry
- Industry-specific validation and provisioning
- Industry-specific onboarding checklist

**Benefits**:
- ✅ Consistent user experience
- ✅ Industry-specific data collection
- ✅ Better provisioning (more context)
- ✅ Easier to maintain (one codebase)

---

## 📝 Example: Education-Specific Form

```html
<!-- Step 3 for Education -->
<div class="form-group">
  <label for="schoolName">School Name *</label>
  <input type="text" id="schoolName" name="schoolName" required>
</div>

<div class="form-group">
  <label for="schoolType">School Type *</label>
  <select id="schoolType" name="schoolType" required>
    <option value="">Select...</option>
    <option value="k12">K-12 School</option>
    <option value="college">College</option>
    <option value="university">University</option>
  </select>
</div>

<div class="form-group">
  <label for="schoolEmail">School Email</label>
  <input type="email" id="schoolEmail" name="schoolEmail">
  <small>Official school email address</small>
</div>

<div class="form-group">
  <label for="schoolPhone">School Phone</label>
  <input type="tel" id="schoolPhone" name="schoolPhone">
</div>

<!-- Still show slug and industry (pre-filled) -->
<div class="form-group">
  <label for="slug">Tenant Subdomain *</label>
  <!-- ... slug input ... -->
</div>
```

---

## 🚀 Quick Implementation

Would you like me to:
1. **Enhance the current signup modal** with industry-specific fields?
2. **Create separate signup forms** for each industry?
3. **Keep it generic** but add industry-specific validation?

Let me know your preference and I'll implement it!
