# Client Portal - User Guide

## Overview

The Client Portal feature allows you to configure client access to projects. Clients can view project progress, documents, invoices, and communicate with your team through a dedicated portal interface.

---

## For Administrators & Project Managers

### Enabling Client Portal for a Project

#### During Project Creation

1. **Open Create Project Modal**
   - Click "New Project" button in Projects Overview
   - Fill in basic project information

2. **Enable Client Portal**
   - Scroll to "Client Portal Access" section
   - Toggle "Enable Client Portal Access" to ON

3. **Configure Settings**
   - **Visibility Level:** Choose how much information clients can see
     - **Basic:** Project name, status, deadline
     - **Detailed:** Basic + tasks, progress, milestones
     - **Full:** Complete project access
   
   - **Available Features:** Select which features clients can access
     - ☑ Project Progress
     - ☐ Time Tracking (optional)
     - ☑ Invoices
     - ☑ Documents
     - ☑ Communication

4. **Create Project**
   - Click "Create Project"
   - Client portal will be enabled automatically

#### After Project Creation

1. **Navigate to Project Dashboard**
   - Go to Projects Overview
   - Click on the project
   - Or navigate to `/tenant/:tenantSlug/org/projects/:projectId/dashboard`

2. **Find Client Portal Settings**
   - Scroll down to "Client Portal Settings" section
   - Settings component is displayed at the bottom of the dashboard

3. **Update Settings**
   - Toggle "Enable Client Portal Access" ON/OFF
   - Adjust visibility level
   - Enable/disable specific features
   - Click "Save Changes"

---

## Understanding Visibility Levels

### Basic
**What clients can see:**
- Project name
- Project status (Active, Completed, etc.)
- Deadline/end date
- Basic progress percentage

**What clients cannot see:**
- Individual tasks
- Detailed timeline
- Time tracking data
- Budget information

**Best for:** Simple projects where clients only need status updates

### Detailed
**What clients can see:**
- Everything in Basic
- Individual tasks and their status
- Progress breakdown by task
- Milestones and their completion status
- Timeline view

**What clients cannot see:**
- Time tracking data
- Budget details
- Internal notes

**Best for:** Most projects where clients need to track progress

### Full
**What clients can see:**
- Everything in Detailed
- Time tracking data
- Budget information
- Invoices
- Documents
- Communication history

**What clients cannot see:**
- Internal team communications
- Administrative settings

**Best for:** High-trust relationships where transparency is important

---

## Feature Toggles

### Project Progress ✅ (Recommended)
Allows clients to view:
- Overall project completion percentage
- Task completion status
- Milestone progress
- Project timeline

**When to enable:** Almost always - this is the core feature

### Time Tracking ⚠️ (Optional)
Allows clients to view:
- Hours logged on the project
- Time entries by team members
- Time breakdown by task

**When to enable:** Only if you want to show clients how time is being spent

### Invoices ✅ (Recommended)
Allows clients to:
- View invoices related to the project
- Download invoice PDFs
- See payment status

**When to enable:** If you bill clients for this project

### Documents ✅ (Recommended)
Allows clients to:
- Access project documents
- Download deliverables
- View file versions

**When to enable:** If you share documents with clients

### Communication ✅ (Recommended)
Allows clients to:
- Send messages to the project team
- Provide feedback
- Ask questions

**When to enable:** If you want two-way communication

---

## Managing Client Portal Settings

### Viewing Current Settings

1. Go to Project Dashboard
2. Scroll to "Client Portal Settings" section
3. Current settings are displayed

### Updating Settings

1. Make changes in the settings form
2. Click "Save Changes"
3. Clients will be notified of changes (if notifications are enabled)

### Disabling Client Portal

1. Toggle "Enable Client Portal Access" to OFF
2. Click "Save Changes"
3. Clients will lose access immediately
4. Clients will receive a notification email

---

## Client Portal Status Indicators

### In Projects Overview

Projects with client portal enabled show a **"Portal" badge** with a globe icon 🌐 next to the project status.

### In Project Dashboard

When client portal is enabled, a blue banner appears showing:
- "Client Portal Enabled" status
- Brief description
- "Active" indicator

---

## Best Practices

### 1. Start with Basic Visibility
- Begin with "Basic" visibility level
- Enable only essential features
- Increase access as trust builds

### 2. Enable Features Gradually
- Start with Project Progress and Documents
- Add Communication after initial setup
- Add Time Tracking only if necessary

### 3. Communicate Changes
- Notify clients when enabling portal
- Explain what they can access
- Provide portal login instructions

### 4. Regular Reviews
- Review portal settings quarterly
- Adjust based on project phase
- Disable if project is on hold

### 5. Security Considerations
- Only enable for trusted clients
- Use "Basic" or "Detailed" for most projects
- Reserve "Full" for high-value, long-term clients

---

## Troubleshooting

### Client Cannot Access Portal

**Check:**
1. Is client portal enabled? (Check project settings)
2. Does client have portal account? (Contact admin)
3. Is project assigned to the correct client?
4. Are there any error messages in audit logs?

### Settings Not Saving

**Check:**
1. Do you have permission to edit settings? (Admin/Project Manager only)
2. Are you within rate limit? (5 changes per 5 minutes)
3. Are all required fields filled?
4. Check browser console for errors

### Client Sees Wrong Information

**Check:**
1. Verify visibility level setting
2. Check feature toggles
3. Ensure project is assigned to correct client
4. Review audit logs for access attempts

---

## Permissions

### Who Can Manage Client Portal Settings?

**Can View Settings:**
- ✅ Admins
- ✅ Super Admins
- ✅ Org Managers
- ✅ Project Managers
- ✅ PMO
- ✅ Team Leads
- ✅ Developers
- ✅ Employees

**Can Edit Settings:**
- ✅ Admins
- ✅ Super Admins
- ✅ Org Managers
- ✅ Project Managers
- ✅ PMO
- ❌ Team Leads (view only)
- ❌ Developers (view only)
- ❌ Employees (view only)
- ❌ Clients (no access)

---

## Rate Limits

**Settings Updates:** 5 changes per 5 minutes per project

**Note:** Admins, Super Admins, and Org Managers bypass rate limits for bulk operations.

---

## Support

For issues or questions:
1. Check this guide first
2. Review API documentation
3. Check audit logs
4. Contact support with:
   - Project ID
   - Error message
   - Trace ID (if available)

---

## Quick Reference

### Enable Portal During Creation
```
Create Project → Enable Client Portal → Configure → Create
```

### Enable Portal After Creation
```
Project Dashboard → Client Portal Settings → Enable → Save
```

### Disable Portal
```
Project Dashboard → Client Portal Settings → Disable → Save
```

### Change Visibility
```
Project Dashboard → Client Portal Settings → Select Level → Save
```

---

**Last Updated:** 2025-01-XX
**Version:** 1.0.0
