# API Migration Guide

This document outlines the API route consolidation changes and migration paths for backward compatibility.

## Overview

As part of the refactoring effort, several route files have been consolidated to reduce duplication and improve maintainability. All changes maintain backward compatibility where possible.

## Attendance Routes Consolidation

### Before
- Multiple attendance route files scattered across the codebase
- Admin attendance routes in separate files
- Duplicate route registrations

### After
- **Single consolidated file**: `modules/business/routes/attendance.js`
- **Admin endpoints**: All admin endpoints are prefixed with `/admin`
- **Route paths**:
  - Regular endpoints: `/api/attendance/*`
  - Admin endpoints: `/api/attendance/admin/*`
  - Backward compatibility: `/api/admin/attendance/admin/*`

### Admin Endpoints Available

All admin endpoints are accessible at `/api/attendance/admin/*`:

- `GET /api/attendance/admin/stats` - Get attendance statistics
- `GET /api/attendance/admin/overview` - Get attendance overview
- `GET /api/attendance/admin/pending-approvals` - Get pending approval requests
- `POST /api/attendance/admin/manual-entry` - Create manual attendance entry
- `POST /api/attendance/admin/bulk-status-update` - Bulk update attendance status
- `POST /api/attendance/admin/bulk-action` - Perform bulk actions
- `POST /api/attendance/admin/approve/:approvalId` - Approve correction request
- `POST /api/attendance/admin/reject/:approvalId` - Reject correction request
- `GET /api/attendance/admin/export` - Export attendance data
- `GET /api/attendance/admin/realtime` - Get real-time attendance data
- `GET /api/attendance/admin/trending-metrics` - Get trending metrics
- `GET /api/attendance/admin/insights` - Get attendance insights

### Migration Notes

- **No breaking changes**: All existing endpoints continue to work
- **Legacy routes maintained**: Routes like `/api/employee-attendance`, `/api/modern-attendance`, etc. still work but point to the consolidated route
- **Recommended**: Update clients to use `/api/attendance/admin/*` for admin endpoints

## Messaging Routes Consolidation

### Before
- Admin messaging routes in `modules/admin/routes/messaging.js`
- Business messaging routes in `modules/business/routes/messaging.js`
- Duplicate route file at `routes/messaging.js`

### After
- **Single consolidated file**: `modules/business/routes/messaging.js`
- **Admin endpoints**: All admin endpoints are prefixed with `/admin`
- **Route paths**:
  - Regular endpoints: `/api/messaging/*`
  - Admin endpoints: `/api/messaging/admin/*`
  - Backward compatibility: `/api/admin/messaging/admin/*` (via compatibility router)

### Admin Endpoints Available

All admin endpoints are accessible at `/api/messaging/admin/*`:

- `GET /api/messaging/admin/stats` - Get messaging dashboard statistics
- `GET /api/messaging/admin/chats` - Get all chats for admin view
- `GET /api/messaging/admin/chats/:chatId/messages` - Get messages for a specific chat (admin view)
- `GET /api/messaging/admin/flagged` - Get flagged messages for moderation
- `POST /api/messaging/admin/moderate` - Moderate a message (approve, reject, delete)
- `DELETE /api/messaging/admin/chats/:chatId` - Delete a chat (admin only)
- `POST /api/messaging/admin/chats/:chatId/archive` - Archive a chat
- `GET /api/messaging/admin/audit-logs` - Get audit logs for messaging
- `GET /api/messaging/admin/user-reports` - Get user reports for messaging
- `GET /api/messaging/admin/settings` - Get messaging settings
- `PUT /api/messaging/admin/settings` - Update messaging settings
- `GET /api/messaging/admin/analytics` - Get messaging analytics
- `GET /api/messaging/admin/chat/:employeeId` - Get chat history with specific employee
- `POST /api/messaging/admin/send` - Send message to employee(s)
- `GET /api/messaging/admin/employees` - Get all employees for admin chat

### Migration Notes

- **Backward compatibility**: A compatibility router maintains `/api/admin/messaging/*` endpoints
- **Recommended**: Update clients to use `/api/messaging/admin/*` for admin endpoints
- **Old route file removed**: `routes/messaging.js` has been deleted (was duplicate)

## Files Deleted

The following duplicate files have been removed:

### Attendance Routes
- `routes/attendance.js`
- `routes/attendanceIntegration.js`
- `routes/adminAttendance.js`
- `routes/adminAttendancePanel.js`
- `routes/calendarAttendance.js`
- `routes/employeeAttendance.js`
- `routes/modernAttendance.js`
- `routes/simpleAttendance.js`
- `routes/softwareHouseAttendance.js`
- `modules/admin/routes/attendance.js` (merged into business attendance)

### Messaging Routes
- `routes/messaging.js` (duplicate of business messaging)

### Master ERP Routes
- `routes/masterERP.js`
- `routes/masterERP-fixed.js`
- `modules/business/routes/masterERPFixed.js`

## Testing

### Attendance Routes Verification

A verification script has been created at `scripts/verify-attendance-routes.js` to verify all attendance endpoints are properly registered.

### Testing Admin Endpoints

To test admin endpoints, ensure you have:
1. Valid authentication token
2. Admin or super_admin role
3. Proper organization context

Example test:
```bash
# Test admin attendance stats
curl -X GET http://localhost:3000/api/attendance/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test admin messaging stats
curl -X GET http://localhost:3000/api/messaging/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Backward Compatibility

All changes maintain backward compatibility:

1. **Legacy route paths still work**: Old route registrations are maintained
2. **Compatibility routers**: Special routers handle path translation for backward compatibility
3. **No breaking changes**: Existing API contracts remain unchanged

## Next Steps

1. **Update client applications**: Gradually migrate to new endpoint paths
2. **Monitor usage**: Track usage of legacy endpoints
3. **Deprecation timeline**: Plan deprecation of legacy routes (if needed)
4. **Documentation**: Update API documentation with new endpoint structure

## Support

For questions or issues related to these changes, please refer to:
- `REFACTORING_PROGRESS.md` for detailed progress tracking
- Route files in `modules/business/routes/` for implementation details

