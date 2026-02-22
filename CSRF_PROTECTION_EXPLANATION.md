# CSRF Protection - Why It's Needed & How to Configure

## 🔒 Why CSRF Protection is Necessary

**CSRF (Cross-Site Request Forgery)** is a security vulnerability that allows attackers to trick authenticated users into performing actions they didn't intend to perform.

### Real-World Example:
1. You're logged into your ERP system (http://localhost:3000)
2. You visit a malicious website (http://evil-site.com)
3. That website contains this code:
   ```html
   <form action="http://localhost:3000/api/tenant/aaaa/organization/projects" method="POST">
     <input name="name" value="Malicious Project">
     <input name="budget" value="999999">
   </form>
   <script>document.forms[0].submit();</script>
   ```
4. Because you're logged in, your browser automatically sends your authentication cookie
5. **The malicious site creates a project in your account without your knowledge!**

### How CSRF Protection Prevents This:
- **Double Submit Cookie Pattern**: Requires both:
  - Cookie with token payload (can't be read by malicious sites due to SameSite)
  - Header with token hash (malicious sites can't set custom headers)
- **Attack fails** because the malicious site can't access the cookie or set the header

---

## ⚙️ Configuration Options

### Option 1: Disable CSRF for Development (Recommended for Testing)

Add to your `.env` file:
```env
DISABLE_CSRF_PROTECTION=true
```

Then update the middleware to check this:

```javascript
// In csrfProtection.js
shouldSkipCSRF(req) {
  // Skip if disabled via environment variable
  if (process.env.DISABLE_CSRF_PROTECTION === 'true') {
    return true;
  }
  // ... rest of the logic
}
```

### Option 2: Fix the Current Implementation

The issue is that the CSRF token isn't being properly extracted and sent. Let's fix it properly.

### Option 3: Use API Key Authentication Instead

For development, you could use API keys instead of CSRF tokens.

---

## 🛠️ Quick Fix: Disable CSRF for Development

I'll add an environment variable check to disable CSRF in development mode.
