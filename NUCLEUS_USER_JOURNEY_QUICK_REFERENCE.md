# Nucleus Project OS - Quick Reference Guide

## 🎯 User Journey Quick Reference

### **Three Main User Types:**

1. **👨‍💼 Project Manager (PM)** - Manages projects, deliverables, approvals
2. **👨‍💻 Team Member** - Works on tasks, updates progress
3. **👔 Client** - Views progress, approves deliverables, requests changes

---

## 📱 Simplified User Flows

### **Flow 1: First Login (New User)**

```
Login → Onboarding → Create Workspace → Choose Template → Create Project → Dashboard
```

**What Happens:**
1. User logs in with email/password
2. System detects first-time user
3. User creates workspace (e.g., "Gamma Tech Solutions")
4. User selects template (Website/Mobile App/Custom)
5. System creates project with 4 deliverables automatically
6. User lands on dashboard

**Time:** ~10 minutes

---

### **Flow 2: Create New Project (PM)**

```
Dashboard → Create Project → Select Workspace → Choose Template → Enter Details → Project Created
```

**What Happens:**
1. PM clicks "Create Project"
2. PM selects workspace
3. PM chooses template (or creates empty project)
4. PM enters project name, dates
5. System creates project + deliverables + tasks (if template)
6. PM sees project in dashboard

**Time:** ~2 minutes

---

### **Flow 3: Create Deliverable (PM)**

```
Project Dashboard → Create Deliverable → Enter Details → Submit → Deliverable Created
```

**What Happens:**
1. PM opens project
2. PM clicks "Create Deliverable"
3. PM enters: name, description, start date, target date, acceptance criteria
4. System creates deliverable with status = 'created'
5. Deliverable appears in list

**Time:** ~3 minutes

---

### **Flow 4: Link Tasks to Deliverable (PM)**

```
Deliverable Dashboard → Link Tasks → Select Tasks → Link → Progress Updated
```

**What Happens:**
1. PM opens deliverable
2. PM clicks "Link Tasks"
3. PM selects tasks from list
4. System links tasks to deliverable
5. System auto-calculates deliverable progress

**Time:** ~1 minute

---

### **Flow 5: Complete Task (Team Member)**

```
Dashboard → View Task → Update Status → Mark Complete → Progress Updated
```

**What Happens:**
1. Team member opens task
2. Team member updates status to "In Progress"
3. Team member marks task as "Completed"
4. System updates task status
5. System recalculates deliverable progress
6. If all tasks complete, system auto-updates deliverable to 'ready_approval'

**Time:** ~30 seconds

---

### **Flow 6: Create Approval Chain (PM)**

```
Deliverable → Create Approval Chain → Enter Approvers → Submit → Chain Created
```

**What Happens:**
1. PM opens deliverable
2. PM clicks "Create Approval Chain"
3. PM enters: Dev Lead, QA Lead, Client Email
4. System creates 3-step sequential approval chain
5. System notifies Dev Lead

**Time:** ~2 minutes

---

### **Flow 7: Approve Step (Internal Team)**

```
Dashboard → View Approval → Review Deliverable → Approve → Next Step Unlocked
```

**What Happens:**
1. Dev Lead sees approval request
2. Dev Lead reviews deliverable
3. Dev Lead clicks "Approve"
4. System validates previous step (none for Step 1)
5. System marks step as approved
6. System unlocks next step
7. System notifies QA Lead

**Time:** ~2 minutes

---

### **Flow 8: Client Approves Deliverable**

```
Client Portal → View Deliverables → Select Deliverable → Approve → Status Updated
```

**What Happens:**
1. Client logs into client portal
2. Client views deliverables (read-only)
3. Client clicks on deliverable
4. Client sees approval button (if ready)
5. Client clicks "Approve"
6. System validates previous steps approved
7. System marks client step as approved
8. System updates deliverable status = 'approved'
9. System notifies PM

**Time:** ~1 minute

---

### **Flow 9: Client Submits Change Request**

```
Client Portal → Deliverable → Request Change → Enter Description → Submit → PM Notified
```

**What Happens:**
1. Client views deliverable
2. Client clicks "Request Change"
3. Client enters change description
4. System creates change request (status = 'submitted')
5. System notifies PM via Slack

**Time:** ~1 minute

---

### **Flow 10: PM Evaluates Change Request**

```
Dashboard → Change Requests → Select Request → Evaluate → Enter Details → Submit → Client Notified
```

**What Happens:**
1. PM sees change request notification
2. PM opens change request
3. PM clicks "Evaluate"
4. PM enters: effort days, cost, timeline impact, recommendation
5. System updates status = 'evaluated'
6. System notifies client

**Time:** ~5 minutes

---

### **Flow 11: Client Decides on Change Request**

```
Client Portal → Change Requests → View Evaluation → Accept/Reject → Deliverable Updated
```

**What Happens:**
1. Client sees evaluation notification
2. Client views PM evaluation
3. Client clicks "Accept" or "Reject"
4. If accepted: System updates deliverable target date
5. System notifies PM
6. Deliverable shows new target date

**Time:** ~1 minute

---

### **Flow 12: View Analytics (PM)**

```
Dashboard → Analytics → Select View → See Statistics
```

**What Happens:**
1. PM clicks "Analytics"
2. PM selects view (Workspace Stats, At-Risk, Pending Approvals, etc.)
3. System calculates statistics
4. System displays charts and metrics

**Time:** ~10 seconds

---

## 🎨 Visual Flow Map

### **PM Journey:**
```
Login → Dashboard → Create Project → Create Deliverable → Link Tasks → 
Create Approval Chain → Monitor Progress → View Analytics
```

### **Team Member Journey:**
```
Login → Dashboard → View Tasks → Update Status → Complete Task → 
Progress Auto-Updated
```

### **Client Journey:**
```
Login → Client Portal → View Deliverables → Approve → 
Request Changes → View Updates
```

---

## ⚡ Key Automation Points

1. **Auto-Progress Calculation**
   - When task status changes → Deliverable progress updates
   - When all tasks complete → Deliverable status → 'ready_approval'

2. **Auto-Status Updates**
   - All approvals complete → Deliverable status → 'approved'
   - Change request accepted → Deliverable target date updates

3. **Auto-Notifications**
   - Approval step completed → Next approver notified
   - Change request submitted → PM notified
   - Change request evaluated → Client notified

---

## 🔍 Decision Points

### **Can User Access?**
- ✅ User is workspace member → Access granted
- ❌ User not workspace member → Access denied (403)

### **Can User Approve?**
- ✅ User is approver + Previous step approved → Can approve
- ❌ Previous step not approved → Error: "Previous step must be approved"

### **Is Deliverable Ready?**
- ✅ Status = 'ready_approval' + Previous steps approved → Ready
- ❌ Status not ready → Error: "Not ready for approval"

---

## 📊 Status Flow Diagram

### **Deliverable Status Flow:**
```
created → in_dev → ready_approval → approved → shipped
                ↓
            in_rework (if rejected)
```

### **Approval Status Flow:**
```
pending → approved → (unlocks next step)
       ↓
    rejected → in_rework
```

### **Change Request Status Flow:**
```
submitted → evaluated → accepted → (deliverable updated)
                      ↓
                  rejected
```

---

## 🎯 Quick Actions Reference

### **PM Actions:**
- ✅ Create project (with template)
- ✅ Create deliverable
- ✅ Link tasks to deliverable
- ✅ Create approval chain
- ✅ Evaluate change requests
- ✅ View analytics
- ✅ Batch operations

### **Team Member Actions:**
- ✅ View assigned tasks
- ✅ Update task status
- ✅ Complete tasks
- ✅ View deliverable progress

### **Client Actions:**
- ✅ View deliverables (read-only)
- ✅ View Gantt chart
- ✅ Approve deliverables
- ✅ Submit change requests
- ✅ Decide on change requests

---

## 🚨 Common Error Scenarios

### **Error 1: Cannot Approve - Previous Step Not Approved**
**Cause:** Trying to approve Step 2 before Step 1  
**Solution:** Approve steps in order (1 → 2 → 3)

### **Error 2: Access Denied - Not Workspace Member**
**Cause:** User not added to workspace  
**Solution:** Workspace admin must add user

### **Error 3: Deliverable Not Ready for Approval**
**Cause:** Status not 'ready_approval'  
**Solution:** PM must mark deliverable as ready

### **Error 4: Cannot Link Task - Task Not in Project**
**Cause:** Task belongs to different project  
**Solution:** Create task in same project first

---

## 📈 Success Indicators

### **Project Success:**
- ✅ All deliverables created
- ✅ Tasks linked to deliverables
- ✅ Approval chains created
- ✅ Progress tracking active

### **Deliverable Success:**
- ✅ All tasks complete
- ✅ Status = 'ready_approval'
- ✅ Approval chain created
- ✅ All approvals received

### **Change Request Success:**
- ✅ PM evaluated
- ✅ Client decided
- ✅ Deliverable updated (if accepted)

---

## 🎓 Learning Path

### **Day 1: Basics**
1. Login and navigate dashboard
2. Create workspace
3. Create project from template
4. View deliverables

### **Day 2: Task Management**
1. Create tasks
2. Link tasks to deliverables
3. Update task status
4. Complete tasks

### **Day 3: Approval Workflow**
1. Create approval chain
2. Approve steps
3. Monitor approval progress
4. Handle rejections

### **Day 4: Advanced Features**
1. Submit change requests
2. Evaluate change requests
3. View analytics
4. Use batch operations

---

## 💡 Pro Tips

1. **Use Templates:** Save time by using pre-built templates
2. **Link Tasks Early:** Link tasks when creating them for auto-progress
3. **Monitor At-Risk:** Check analytics regularly for at-risk deliverables
4. **Batch Operations:** Use batch operations for multiple deliverables
5. **Slack Integration:** Enable Slack for real-time notifications

---

**This quick reference complements the detailed flow diagram for easy navigation and understanding.**
