# Signup Modal Troubleshooting Guide

## ✅ Fixes Applied

### 1. Improved Initialization
- Added retry logic with max attempts (5 seconds)
- Better error handling and logging
- Multiple initialization attempts (DOMContentLoaded + window.load)

### 2. Safe Modal Opening Function
- Created `openSignupModalSafe()` function
- Handles all edge cases
- Provides helpful error messages

### 3. Better Script Loading
- Added error handlers to script tags
- Verification script on page load
- Automatic retry if initialization fails

---

## 🔍 How to Debug

### Step 1: Open Browser Console
Press `F12` or `Right-click → Inspect → Console`

### Step 2: Check for Errors
Look for:
- ❌ Red error messages
- ⚠️ Yellow warnings
- ✅ Green success messages

### Step 3: Verify Scripts Loaded
You should see:
```
=== Signup Modal Status ===
SignupFlows: ✅ Loaded
SignupModalV2: ✅ Loaded
window.signupModal: ✅ Initialized
```

### Step 4: Test Modal Opening
Click "Start Free Trial" button and check console for:
- `openSignupModalSafe called`
- `Modal initialized, opening...`
- Or error messages

---

## 🐛 Common Issues & Solutions

### Issue 1: "SignupFlows not loaded"
**Symptoms:**
- Console shows: `SignupFlows: ❌ Missing`

**Solutions:**
1. Check if `signup-flows.js` file exists in `erp-pages/` folder
2. Check browser Network tab - is `signup-flows.js` loading? (Status 200?)
3. Check for JavaScript errors in `signup-flows.js`
4. Verify script path is correct: `src="signup-flows.js"`

### Issue 2: "SignupModalV2 not loaded"
**Symptoms:**
- Console shows: `SignupModalV2: ❌ Missing`

**Solutions:**
1. Check if `signup-modal-v2.js` file exists
2. Check browser Network tab - is `signup-modal-v2.js` loading?
3. Check for JavaScript syntax errors
4. Verify script loads AFTER `signup-flows.js`

### Issue 3: "Modal HTML element not found"
**Symptoms:**
- Console shows: `❌ Modal HTML element not found after initialization`

**Solutions:**
1. Check if `document.body` exists when modal tries to initialize
2. Check for JavaScript errors during HTML generation
3. Verify flow configuration is valid

### Issue 4: Script Loading Order
**Correct Order:**
```html
<!-- 1. Load flows first -->
<script src="signup-flows.js"></script>
<!-- 2. Then load modal -->
<script src="signup-modal-v2.js"></script>
```

---

## 🧪 Manual Test

### Test 1: Check Scripts in Console
```javascript
// Run in browser console
console.log('SignupFlows:', typeof SignupFlows);
console.log('SignupModalV2:', typeof SignupModalV2);
console.log('window.signupModal:', window.signupModal);
```

### Test 2: Manual Initialization
```javascript
// Run in browser console
if (typeof SignupFlows !== 'undefined' && typeof SignupModalV2 !== 'undefined') {
  window.signupModal = new SignupModalV2('healthcare');
  window.signupModal.open();
}
```

### Test 3: Check Modal Element
```javascript
// Run in browser console
const modal = document.getElementById('signupModal');
console.log('Modal element:', modal);
```

---

## 📋 Checklist

- [ ] `signup-flows.js` exists and loads (check Network tab)
- [ ] `signup-modal-v2.js` exists and loads (check Network tab)
- [ ] Scripts load in correct order (flows → modal)
- [ ] No JavaScript errors in console
- [ ] `openSignupModalSafe()` function exists (check console: `typeof openSignupModalSafe`)
- [ ] Modal HTML element created (check: `document.getElementById('signupModal')`)

---

## 🔧 Quick Fixes

### Fix 1: Force Reload Scripts
```javascript
// Run in console to reload scripts
location.reload(true);
```

### Fix 2: Manual Modal Creation
```javascript
// Run in console if scripts are loaded but modal isn't
const industry = 'healthcare';
window.signupModal = new SignupModalV2(industry);
window.signupModal.open();
```

### Fix 3: Check File Paths
Make sure you're accessing the page correctly:
- Local: `file:///path/to/healthcare.html` (may have CORS issues)
- Server: `http://localhost/healthcare.html` (recommended)
- Relative paths: Scripts should be in same folder as HTML

---

## 📞 If Still Not Working

1. **Check Browser Console** - Look for specific error messages
2. **Check Network Tab** - Verify scripts are loading (Status 200)
3. **Check File Paths** - Ensure scripts are in correct location
4. **Try Different Browser** - Rule out browser-specific issues
5. **Clear Cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## ✅ Expected Behavior

When clicking "Start Free Trial":
1. Modal should appear (dark overlay + modal content)
2. Console should show: `✅ Modal initialized successfully`
3. First step form should be visible
4. No error alerts should appear

---

**Last Updated**: After fixing initialization issues
