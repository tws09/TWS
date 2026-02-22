# Route Debugging Guide

## Issue: 404 Errors for Finance Routes

### Routes Being Called:
- `/api/tenant/aaaa/software-house/dashboard` - 404
- `/api/tenant/aaaa/software-house/finance` - 404
- `/api/tenant/aaaa/software-house/finance/accounts-payable` - 404
- `/api/tenant/aaaa/software-house/finance/accounts-receivable` - 404
- `/api/tenant/aaaa/software-house/finance/banking` - 404

### Expected Route Structure:
```
/api/tenant/:tenantSlug/software-house/finance/*
```

### Route Mounting (app.js):
```javascript
app.use('/api/tenant/:tenantSlug/software-house', modules.tenant.softwareHouse);
```

### Router Configuration (softwareHouse.js):
```javascript
const router = express.Router({ mergeParams: true });
```

### Possible Issues:

1. **Server Not Restarted**: The server may need to be restarted after route changes
2. **Route Registration Order**: Routes might need to be defined in a specific order
3. **Middleware Issues**: `authenticateToken` or `buildTenantContext` might be failing silently
4. **Route Path Mismatch**: The route paths might not match what's being called

### Debugging Steps:

1. **Check if router is exported correctly**:
   ```javascript
   module.exports = router;
   ```

2. **Verify route mounting in app.js**:
   - Check line 212: `app.use('/api/tenant/:tenantSlug/software-house', modules.tenant.softwareHouse);`

3. **Add test route**:
   - Added `/finance/test` route to verify router is working

4. **Check server logs**:
   - Look for route registration messages
   - Check for any errors during route loading

5. **Verify tenantSlug parameter**:
   - Ensure `mergeParams: true` is set on the router
   - Check if `req.params.tenantSlug` is available in route handlers

### Next Steps:

1. Restart the backend server
2. Test the `/finance/test` route first
3. Check server console for route registration messages
4. Verify the tenant exists and has `erpCategory: 'software_house'`
5. Check if `authenticateToken` middleware is working correctly

