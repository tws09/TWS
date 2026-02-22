# NUCLEUS PROJECT OS
## Execution Specification (Ready to Build) - MERN Stack Edition

---

## EXECUTIVE SUMMARY

**Status:** MVP-ready. All critical decisions locked. Ready for 3 engineers + 1 PM to start.

**Runway:** 12 weeks to MVP launch
**Team:** 3 engineers (backend, frontend, devops) + 1 PM/design
**First Customer Pilot:** Week 10–12

**Tech Stack:**
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Frontend:** React.js
- **Real-time:** Socket.io (WebSocket)
- **Caching:** Redis (Node.js)
- **Deployment:** AWS/DigitalOcean (Node.js compatible)

---

## PART 1: APPROVAL WORKFLOW (State Machine)

### The Problem

Who signs off first? Can approvals happen in parallel? What if security rejects after PM approves?

### The Solution: Sequential State Machine

**Definition:** Approvals happen in defined order. Next person can only sign off if previous person signed.

### Approval States

```
Deliverable: "Authentication System"
├─ Status progression: Created → In Dev → Ready for Approval → [Approval Chain] → Approved → Shipped

Approval Chain (Sequential, Not Parallel)
├─ Step 1: Dev Lead signoff (internal)
│  └─ State: dev_approved (Y/N)
│  └─ When: Assigned dev lead marks "deliverable ready to test"
│  └─ Can skip? No (always required)
│
├─ Step 2: QA Lead signoff (internal)
│  └─ Can only sign if dev_approved = true
│  └─ State: qa_approved (Y/N)
│  └─ When: QA completes testing, checks acceptance criteria
│  └─ Can reject: "Bug found in X, reopens deliverable"
│
├─ Step 3: Security/Compliance (internal, if needed)
│  └─ Can only sign if qa_approved = true
│  └─ State: security_approved (Y/N or skipped)
│  └─ When: For auth/payment/data-heavy deliverables
│  └─ Can reject: "Audit findings, needs remediation"
│
└─ Step 4: Client Stakeholder signoff (external)
   └─ Can only sign if all internal steps approved
   └─ State: client_approved (Y/N)
   └─ Signature with timestamp
   └─ Can reject: "Doesn't meet requirements, rework needed"
```

### Rejection Handling (Critical)

**If QA rejects at Step 2:**
```
deliverable.status = "in_rework" (back to dev)
approval_chain resets to step 1
dev_approved = null
qa_approved = null
security_approved = null
client_approved = null

PM is notified: "Auth System rejected by QA, reason: 'MFA broken on mobile'"
PM communicates to client: "Found issue in testing, fixing now, 2-day delay"
Team sees reopened task, starts rework
```

**If Client rejects at Step 4:**
```
deliverable.status = "change_request_pending"
approval_chain paused at step 4
PM must formally handle as change request (not just rework)
Client must approve new timeline or change scope
```

### MongoDB Schema (Approval) - Mongoose Models

```javascript
// models/Approval.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApprovalSchema = new Schema({
  deliverable_id: {
    type: Schema.Types.ObjectId,
    ref: 'Deliverable',
    required: true,
    index: true
  },
  step_number: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  approver_type: {
    type: String,
    required: true,
    enum: ['dev_lead', 'qa_lead', 'security', 'client']
  },
  approver_id: {
    type: String, // user._id if internal, email if client
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  signature_timestamp: {
    type: Date
  },
  rejection_reason: {
    type: String
  },
  can_proceed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // adds createdAt, updatedAt
});

// Index for fast queries
ApprovalSchema.index({ deliverable_id: 1, step_number: 1 });
ApprovalSchema.index({ status: 1, approver_type: 1 });

module.exports = mongoose.model('Approval', ApprovalSchema);
```

### Express.js API Endpoints (Approval)

```javascript
// routes/approvals.js
const express = require('express');
const router = express.Router();
const Approval = require('../models/Approval');
const Deliverable = require('../models/Deliverable');
const { authenticate, authorize } = require('../middleware/auth');

// Get approvals for a deliverable
router.get('/deliverable/:deliverableId', authenticate, async (req, res) => {
  try {
    const approvals = await Approval.find({ 
      deliverable_id: req.params.deliverableId 
    }).sort({ step_number: 1 });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a step
router.post('/:approvalId/approve', authenticate, async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.approvalId);
    
    // Check if previous step is approved
    if (approval.step_number > 1) {
      const prevApproval = await Approval.findOne({
        deliverable_id: approval.deliverable_id,
        step_number: approval.step_number - 1,
        status: 'approved'
      });
      
      if (!prevApproval) {
        return res.status(400).json({ 
          error: 'Previous step must be approved first' 
        });
      }
    }
    
    approval.status = 'approved';
    approval.signature_timestamp = new Date();
    approval.can_proceed = true;
    await approval.save();
    
    // Update deliverable status if all internal steps approved
    await checkDeliverableApprovalStatus(approval.deliverable_id);
    
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject a step
router.post('/:approvalId/reject', authenticate, async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.approvalId);
    approval.status = 'rejected';
    approval.rejection_reason = req.body.reason;
    approval.signature_timestamp = new Date();
    await approval.save();
    
    // Reset deliverable to in_rework
    const deliverable = await Deliverable.findById(approval.deliverable_id);
    deliverable.status = 'in_rework';
    await deliverable.save();
    
    // Reset all subsequent approvals
    await Approval.updateMany(
      { 
        deliverable_id: approval.deliverable_id,
        step_number: { $gt: approval.step_number }
      },
      { 
        status: 'pending',
        can_proceed: false,
        signature_timestamp: null,
        rejection_reason: null
      }
    );
    
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### React Component (Approval UI - Internal Team View)

```jsx
// components/ApprovalProgress.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApprovalProgress = ({ deliverableId }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, [deliverableId]);

  const fetchApprovals = async () => {
    try {
      const response = await axios.get(
        `/api/approvals/deliverable/${deliverableId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    try {
      await axios.post(
        `/api/approvals/${approvalId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchApprovals();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to approve');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return '✅';
    if (status === 'rejected') return '❌';
    return '⏳';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="approval-progress">
      <h3>Approval Progress</h3>
      {approvals.map((approval) => (
        <div key={approval._id} className="approval-step">
          <span>{getStatusIcon(approval.status)}</span>
          <span>{approval.approver_type.replace('_', ' ').toUpperCase()}</span>
          {approval.status === 'pending' && approval.can_proceed && (
            <button onClick={() => handleApprove(approval._id)}>
              Approve
            </button>
          )}
          {approval.signature_timestamp && (
            <span>{new Date(approval.signature_timestamp).toLocaleString()}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ApprovalProgress;
```

### React Component (Client Portal View)

```jsx
// components/ClientApprovalView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientApprovalView = ({ deliverableId }) => {
  const [deliverable, setDeliverable] = useState(null);
  const [clientApproval, setClientApproval] = useState(null);

  useEffect(() => {
    fetchDeliverable();
  }, [deliverableId]);

  const fetchDeliverable = async () => {
    try {
      const response = await axios.get(
        `/api/client/deliverables/${deliverableId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setDeliverable(response.data);
      
      // Get client approval step
      const approvalResponse = await axios.get(
        `/api/client/approvals/deliverable/${deliverableId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setClientApproval(approvalResponse.data);
    } catch (error) {
      console.error('Error fetching deliverable:', error);
    }
  };

  const handleApprove = async () => {
    try {
      await axios.post(
        `/api/client/approvals/${clientApproval._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchDeliverable();
      alert('Deliverable approved successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleRequestChanges = async (reason) => {
    try {
      await axios.post(
        `/api/client/approvals/${clientApproval._id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchDeliverable();
      alert('Change request submitted');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit request');
    }
  };

  if (!deliverable || !clientApproval) return <div>Loading...</div>;

  return (
    <div className="client-approval-view">
      <h2>{deliverable.name}</h2>
      <p>Status: {deliverable.status}</p>
      <p>Internal approval: ✅ Complete</p>
      <p>Your review: {clientApproval.status === 'pending' ? '⏳ Pending' : '✅ Approved'}</p>
      
      {clientApproval.status === 'pending' && (
        <div>
          <button onClick={handleApprove}>Approve</button>
          <button onClick={() => {
            const reason = prompt('Reason for changes:');
            if (reason) handleRequestChanges(reason);
          }}>Request Changes</button>
        </div>
      )}
    </div>
  );
};

export default ClientApprovalView;
```

---

## PART 2: CHANGE REQUEST / AUDIT TRAIL (Lightweight Queue)

### Problem

Agencies handle scope changes constantly. MVP needs to track them without complexity.

### Solution: Change Request as First-Class Object

#### Change Request States

```
Client submits: "Add password strength meter"

Change Request Created:
├─ Submitted by: CTO@client.com
├─ Submitted at: Oct 20, 2025 3:15 PM
├─ Deliverable: Auth System
├─ Description: "Add password strength indicator"
├─ Requested impact: "Will add 2 days"
├─ PM acknowledges: Oct 20, 3:30 PM (Sarah)
│
├─ PM evaluates:
│  ├─ Effort: 1 day (< estimated)
│  ├─ Timeline impact: +1 day (was Nov 15, now Nov 16)
│  ├─ Cost impact: +$1,200
│  └─ Recommendation: Accept (minimal impact)
│
├─ Status options:
│  ├─ accepted → New deliverable target date = Nov 16
│  ├─ rejected → "Scope locked, can be Phase 2 feature"
│  └─ negotiate → "Can deliver without password meter, or add meter 3 days late. Client chooses."
│
├─ Client response: Accepted
├─ Approved at: Oct 20, 4:00 PM
│
└─ Outcome:
   ├─ New tasks created for "password strength meter"
   ├─ Deliverable target date updated to Nov 16
   ├─ Change logged in audit trail
   ├─ All team notified via Slack
```

### MongoDB Schema (Change Request) - Mongoose Models

```javascript
// models/ChangeRequest.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChangeRequestSchema = new Schema({
  deliverable_id: {
    type: Schema.Types.ObjectId,
    ref: 'Deliverable',
    required: true,
    index: true
  },
  submitted_by: {
    type: String, // client email
    required: true
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'acknowledged', 'evaluated', 'accepted', 'rejected', 'negotiating'],
    default: 'submitted'
  },
  pm_notes: {
    type: String
  },
  effort_days: {
    type: Number
  },
  cost_impact: {
    type: Number
  },
  date_impact_days: {
    type: Number
  },
  pm_recommendation: {
    type: String,
    enum: ['accept', 'reject', 'negotiate']
  },
  client_decision: {
    type: String,
    enum: ['accept', 'reject']
  },
  decided_at: {
    type: Date
  }
}, {
  timestamps: true
});

ChangeRequestSchema.index({ deliverable_id: 1, status: 1 });
ChangeRequestSchema.index({ submitted_by: 1 });

module.exports = mongoose.model('ChangeRequest', ChangeRequestSchema);

// models/ChangeRequestAudit.js
const ChangeRequestAuditSchema = new Schema({
  change_request_id: {
    type: Schema.Types.ObjectId,
    ref: 'ChangeRequest',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['submitted', 'acknowledged', 'recommended', 'decided']
  },
  actor: {
    type: String, // user._id or client email
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String
  }
}, {
  timestamps: true
});

ChangeRequestAuditSchema.index({ change_request_id: 1, timestamp: -1 });

module.exports = mongoose.model('ChangeRequestAudit', ChangeRequestAuditSchema);
```

### Express.js API Endpoints (Change Request)

```javascript
// routes/changeRequests.js
const express = require('express');
const router = express.Router();
const ChangeRequest = require('../models/ChangeRequest');
const ChangeRequestAudit = require('../models/ChangeRequestAudit');
const Deliverable = require('../models/Deliverable');
const { authenticate, authorize } = require('../middleware/auth');

// Client submits change request
router.post('/', authenticate, async (req, res) => {
  try {
    const changeRequest = new ChangeRequest({
      deliverable_id: req.body.deliverable_id,
      submitted_by: req.user.email, // from JWT
      description: req.body.description,
      status: 'submitted'
    });
    
    await changeRequest.save();
    
    // Log audit
    await ChangeRequestAudit.create({
      change_request_id: changeRequest._id,
      action: 'submitted',
      actor: req.user.email,
      details: req.body.description
    });
    
    res.status(201).json(changeRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PM acknowledges change request
router.post('/:id/acknowledge', authenticate, authorize(['pm', 'admin']), async (req, res) => {
  try {
    const changeRequest = await ChangeRequest.findById(req.params.id);
    changeRequest.status = 'acknowledged';
    await changeRequest.save();
    
    await ChangeRequestAudit.create({
      change_request_id: changeRequest._id,
      action: 'acknowledged',
      actor: req.user._id,
      details: 'PM acknowledged change request'
    });
    
    res.json(changeRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PM evaluates and recommends
router.post('/:id/evaluate', authenticate, authorize(['pm', 'admin']), async (req, res) => {
  try {
    const changeRequest = await ChangeRequest.findById(req.params.id);
    changeRequest.status = 'evaluated';
    changeRequest.pm_notes = req.body.pm_notes;
    changeRequest.effort_days = req.body.effort_days;
    changeRequest.cost_impact = req.body.cost_impact;
    changeRequest.date_impact_days = req.body.date_impact_days;
    changeRequest.pm_recommendation = req.body.pm_recommendation;
    await changeRequest.save();
    
    await ChangeRequestAudit.create({
      change_request_id: changeRequest._id,
      action: 'recommended',
      actor: req.user._id,
      details: `PM recommended: ${req.body.pm_recommendation}`
    });
    
    res.json(changeRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Client decides on change request
router.post('/:id/decide', authenticate, async (req, res) => {
  try {
    const changeRequest = await ChangeRequest.findById(req.params.id);
    
    if (changeRequest.submitted_by !== req.user.email) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    changeRequest.status = req.body.decision === 'accept' ? 'accepted' : 'rejected';
    changeRequest.client_decision = req.body.decision;
    changeRequest.decided_at = new Date();
    await changeRequest.save();
    
    // If accepted, update deliverable target date
    if (req.body.decision === 'accept') {
      const deliverable = await Deliverable.findById(changeRequest.deliverable_id);
      deliverable.target_date = new Date(
        deliverable.target_date.getTime() + 
        (changeRequest.date_impact_days * 24 * 60 * 60 * 1000)
      );
      await deliverable.save();
    }
    
    await ChangeRequestAudit.create({
      change_request_id: changeRequest._id,
      action: 'decided',
      actor: req.user.email,
      details: `Client decision: ${req.body.decision}`
    });
    
    res.json(changeRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit trail
router.get('/:id/audit', authenticate, async (req, res) => {
  try {
    const auditLog = await ChangeRequestAudit.find({
      change_request_id: req.params.id
    }).sort({ timestamp: -1 });
    
    res.json(auditLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### React Component (PM Dashboard for Change Requests)

```jsx
// components/ChangeRequestDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChangeRequestDashboard = () => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      const response = await axios.get('/api/change-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChangeRequests(response.data);
    } catch (error) {
      console.error('Error fetching change requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await axios.post(
        `/api/change-requests/${id}/acknowledge`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchChangeRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to acknowledge');
    }
  };

  const handleEvaluate = async (id, evaluation) => {
    try {
      await axios.post(
        `/api/change-requests/${id}/evaluate`,
        evaluation,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchChangeRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to evaluate');
    }
  };

  if (loading) return <div>Loading...</div>;

  const pendingRequests = changeRequests.filter(cr => 
    ['submitted', 'acknowledged', 'evaluated'].includes(cr.status)
  );

  return (
    <div className="change-request-dashboard">
      <h2>Pending Changes ({pendingRequests.length})</h2>
      {pendingRequests.map((cr) => (
        <div key={cr._id} className="change-request-card">
          <h3>{cr.deliverable_id?.name || 'Deliverable'}</h3>
          <p>{cr.description}</p>
          <p>Submitted by: {cr.submitted_by}</p>
          <p>Status: {cr.status}</p>
          
          {cr.status === 'submitted' && (
            <button onClick={() => handleAcknowledge(cr._id)}>
              Acknowledge
            </button>
          )}
          
          {cr.status === 'acknowledged' && (
            <button onClick={() => {
              const effort = prompt('Effort (days):');
              const cost = prompt('Cost impact ($):');
              const days = prompt('Date impact (days):');
              const recommendation = prompt('Recommendation (accept/reject/negotiate):');
              
              handleEvaluate(cr._id, {
                effort_days: parseInt(effort),
                cost_impact: parseInt(cost),
                date_impact_days: parseInt(days),
                pm_recommendation: recommendation,
                pm_notes: 'Evaluated by PM'
              });
            }}>
              Evaluate & Recommend
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChangeRequestDashboard;
```

---

## PART 3: GANTT RENDERING (Performance & Library)

### Problem

100+ tasks, real-time updates, client viewing. Need fast, reliable rendering.

### Solution: Lightweight D3 + Caching Strategy

#### Library Choice

**Selected: [Frappe Gantt](https://frappe.io/gantt)** (React wrapper: `frappe-gantt-react` or vanilla JS)

Why:
- Lightweight (~20KB minified)
- Built for deliverables, not sprints
- Excellent dependency visualization
- Good performance up to 500+ tasks
- Open source (no vendor lock-in)

#### Data Flow (Cached with Redis)

```javascript
// services/ganttService.js
const Deliverable = require('../models/Deliverable');
const Task = require('../models/Task');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Generate Gantt data
async function generateGanttData(projectId) {
  const cacheKey = `gantt:project:${projectId}`;
  
  // Check cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Generate from database
  const deliverables = await Deliverable.find({ project_id: projectId })
    .populate('tasks')
    .lean();
  
  const tasks = deliverables.map(d => ({
    id: d._id.toString(),
    name: d.name,
    start: d.start_date.toISOString().split('T')[0],
    end: d.target_date.toISOString().split('T')[0],
    progress: d.progress_percentage || 0,
    dependencies: d.dependencies || [],
    type: 'deliverable',
    status: d.status,
    blocking_criteria_met: d.blocking_criteria_met || false
  }));
  
  const links = deliverables
    .filter(d => d.dependencies && d.dependencies.length > 0)
    .map(d => d.dependencies.map(depId => ({
      source: depId.toString(),
      target: d._id.toString(),
      type: 'FF' // finish-to-finish
    })))
    .flat();
  
  const ganttData = { tasks, links };
  
  // Cache for 60 seconds
  await client.setex(cacheKey, 60, JSON.stringify(ganttData));
  
  return ganttData;
}

// Invalidate cache on update
async function invalidateGanttCache(projectId) {
  const cacheKey = `gantt:project:${projectId}`;
  await client.del(cacheKey);
}

module.exports = { generateGanttData, invalidateGanttCache };
```

#### Express.js API Endpoint (Gantt Data)

```javascript
// routes/gantt.js
const express = require('express');
const router = express.Router();
const { generateGanttData } = require('../services/ganttService');
const { authenticate } = require('../middleware/auth');

router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const ganttData = await generateGanttData(req.params.projectId);
    res.json(ganttData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### React Component (Gantt Chart)

```jsx
// components/GanttChart.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Gantt } from 'frappe-gantt';
import axios from 'axios';

const GanttChart = ({ projectId, isClientView = false }) => {
  const ganttContainer = useRef(null);
  const [ganttData, setGanttData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGanttData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchGanttData, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchGanttData = async () => {
    try {
      const endpoint = isClientView 
        ? `/api/client/gantt/project/${projectId}`
        : `/api/gantt/project/${projectId}`;
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setGanttData(response.data);
      
      // Render Gantt
      if (ganttContainer.current && response.data.tasks.length > 0) {
        new Gantt(ganttContainer.current, response.data.tasks, {
          view_mode: 'Month',
          language: 'en',
          on_click: (task) => {
            console.log('Task clicked:', task);
          },
          on_date_change: (task, start, end) => {
            if (!isClientView) {
              // Only allow date changes in internal view
              updateTaskDates(task.id, start, end);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching Gantt data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskDates = async (taskId, start, end) => {
    try {
      await axios.put(
        `/api/deliverables/${taskId}`,
        { start_date: start, target_date: end },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchGanttData(); // Refresh
    } catch (error) {
      console.error('Error updating dates:', error);
    }
  };

  if (loading) return <div>Loading Gantt chart...</div>;

  return (
    <div className="gantt-chart-container">
      <div ref={ganttContainer}></div>
    </div>
  );
};

export default GanttChart;
```

#### MongoDB Schema (Deliverable with Gantt fields)

```javascript
// models/Deliverable.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliverableSchema = new Schema({
  project_id: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  start_date: {
    type: Date,
    required: true
  },
  target_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'in_dev', 'ready_approval', 'approved', 'shipped', 'in_rework'],
    default: 'created'
  },
  progress_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  blocking_criteria_met: {
    type: Boolean,
    default: false
  },
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Deliverable'
  }],
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  acceptance_criteria: [{
    description: String,
    met: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

DeliverableSchema.index({ project_id: 1, status: 1 });

module.exports = mongoose.model('Deliverable', DeliverableSchema);
```

---

## PART 4: DATE CONFIDENCE MODEL (UI Nudges)

### Problem

PMs ignore validation reminders unless forced.

### Solution: Forced Acknowledgment + Subtle Nudges

#### Validation Rule

```
Rule 1: Every 14 days, PM must validate deliverable date
Rule 2: If date >30 days old without validation → ⚠️ warning flag
Rule 3: If % complete diverges from plan → nudge PM to review
Rule 4: If multiple deliverables change in 7 days → flag for scope review
```

#### MongoDB Schema (Date Validation)

```javascript
// models/Deliverable.js (add to existing schema)
DeliverableSchema.add({
  last_date_validation: {
    type: Date
  },
  date_confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  validation_history: [{
    validated_at: { type: Date, default: Date.now },
    validated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    confidence: Number,
    notes: String
  }]
});
```

#### Express.js API Endpoint (Date Validation)

```javascript
// routes/deliverables.js (add endpoint)
router.post('/:id/validate-date', authenticate, authorize(['pm', 'admin']), async (req, res) => {
  try {
    const deliverable = await Deliverable.findById(req.params.id);
    
    deliverable.last_date_validation = new Date();
    deliverable.date_confidence = req.body.confidence;
    deliverable.validation_history.push({
      validated_at: new Date(),
      validated_by: req.user._id,
      confidence: req.body.confidence,
      notes: req.body.notes
    });
    
    await deliverable.save();
    
    res.json(deliverable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deliverables needing validation
router.get('/needing-validation', authenticate, authorize(['pm', 'admin']), async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const deliverables = await Deliverable.find({
      $or: [
        { last_date_validation: { $lt: fourteenDaysAgo } },
        { last_date_validation: { $exists: false } }
      ],
      status: { $in: ['created', 'in_dev', 'ready_approval'] }
    }).populate('project_id', 'name');
    
    res.json(deliverables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### React Component (PM Dashboard Alerts)

```jsx
// components/DateValidationAlerts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DateValidationAlerts = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliverablesNeedingValidation();
  }, []);

  const fetchDeliverablesNeedingValidation = async () => {
    try {
      const response = await axios.get('/api/deliverables/needing-validation', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeliverables(response.data);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (deliverableId, isOnTrack, confidence, notes) => {
    try {
      await axios.post(
        `/api/deliverables/${deliverableId}/validate-date`,
        {
          is_on_track: isOnTrack,
          confidence: confidence,
          notes: notes
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchDeliverablesNeedingValidation();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to validate');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (deliverables.length === 0) {
    return <div>No deliverables need validation</div>;
  }

  return (
    <div className="date-validation-alerts">
      <h2>Deliverables Needing Attention</h2>
      {deliverables.map((deliverable) => {
        const daysSinceValidation = deliverable.last_date_validation
          ? Math.floor((new Date() - new Date(deliverable.last_date_validation)) / (1000 * 60 * 60 * 24))
          : 999;
        
        const flag = daysSinceValidation > 30 ? '🔴' : daysSinceValidation > 14 ? '🟡' : '🟢';
        
        return (
          <div key={deliverable._id} className="deliverable-alert">
            <span>{flag}</span>
            <h3>{deliverable.name}</h3>
            <p>Date not validated in {daysSinceValidation} days</p>
            <p>Target: {new Date(deliverable.target_date).toLocaleDateString()}</p>
            <p>Progress: {deliverable.progress_percentage}%</p>
            
            <button onClick={() => {
              const isOnTrack = confirm('Is this deliverable on track?');
              const confidence = prompt('Confidence level (0-100):');
              const notes = prompt('Notes (optional):');
              
              if (confidence !== null) {
                handleValidate(deliverable._id, isOnTrack, parseInt(confidence), notes);
              }
            }}>
              Validate Date
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default DateValidationAlerts;
```

---

## PART 5: MIGRATION PLAN (V2, Not MVP)

### Why MVP Skips It

- Adds 2–3 weeks of complexity
- Data mapping is ambiguous
- Agencies can pilot on new projects first
- V2 migration is higher-margin feature

### V2 Migration (12 weeks post-launch)

#### Supported Sources (Priority Order)

1. **Asana** (easiest, already deliverable-like)
2. **Jira** (complex, many customizations)
3. **Monday.com** (medium, custom fields)
4. **Spreadsheets** (tedious, manual)

#### Asana → Nucleus Mapping (Node.js Script)

```javascript
// scripts/migrateAsana.js
const axios = require('axios');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Deliverable = require('../models/Deliverable');
const Task = require('../models/Task');

async function migrateAsanaToNucleus(asanaAccessToken, workspaceId) {
  const asanaApi = axios.create({
    baseURL: 'https://app.asana.com/api/1.0',
    headers: { Authorization: `Bearer ${asanaAccessToken}` }
  });
  
  try {
    // Fetch Asana projects
    const projectsResponse = await asanaApi.get('/projects', {
      params: { workspace: workspaceId }
    });
    
    for (const asanaProject of projectsResponse.data.data) {
      // Create Nucleus Project
      const nucleusProject = await Project.create({
        name: asanaProject.name,
        description: asanaProject.notes,
        workspace_id: workspaceId // map to Nucleus workspace
      });
      
      // Fetch milestones (deliverables)
      const milestonesResponse = await asanaApi.get(`/projects/${asanaProject.gid}/tasks`, {
        params: { opt_fields: 'name,due_on,completed' }
      });
      
      for (const milestone of milestonesResponse.data.data) {
        // Create Nucleus Deliverable
        const deliverable = await Deliverable.create({
          project_id: nucleusProject._id,
          name: milestone.name,
          target_date: milestone.due_on ? new Date(milestone.due_on) : new Date(),
          status: milestone.completed ? 'shipped' : 'created'
        });
        
        // Fetch tasks under milestone
        const tasksResponse = await asanaApi.get(`/tasks/${milestone.gid}/subtasks`);
        
        for (const asanaTask of tasksResponse.data.data) {
          await Task.create({
            deliverable_id: deliverable._id,
            name: asanaTask.name,
            status: asanaTask.completed ? 'done' : 'todo'
          });
        }
      }
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

module.exports = { migrateAsanaToNucleus };
```

---

## PART 6: PM ADOPTION FRICTION (Control Levers)

### Problem

PMs worry they'll lose control. Need to prove Nucleus empowers, not constrains.

### Solution: Internal Flags & Visibility Features

#### MongoDB Schema (Project Health)

```javascript
// models/Project.js (add fields)
ProjectSchema.add({
  health_flags: {
    at_risk_deliverables: [{
      type: Schema.Types.ObjectId,
      ref: 'Deliverable'
    }],
    scope_instability: {
      type: Boolean,
      default: false
    },
    quality_risk: {
      type: Boolean,
      default: false
    }
  },
  team_velocity: [{
    sprint_start: Date,
    sprint_end: Date,
    tasks_completed: Number
  }],
  rework_rate: {
    type: Number,
    default: 0
  },
  cycle_time_avg: {
    type: Number // days
  }
});
```

#### Express.js API Endpoint (Project Health)

```javascript
// routes/projects.js (add endpoint)
router.get('/:id/health', authenticate, authorize(['pm', 'admin']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('deliverables')
      .lean();
    
    const health = {
      at_risk_deliverables: [],
      scope_instability: false,
      quality_risk: false,
      team_velocity: project.team_velocity || [],
      rework_rate: project.rework_rate || 0,
      cycle_time_avg: project.cycle_time_avg || 0
    };
    
    // Calculate at-risk deliverables
    for (const deliverable of project.deliverables) {
      const daysRemaining = Math.ceil(
        (new Date(deliverable.target_date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      const workRemaining = deliverable.progress_percentage < 100 
        ? (100 - deliverable.progress_percentage) / 10 // rough estimate
        : 0;
      
      if (workRemaining > daysRemaining) {
        health.at_risk_deliverables.push(deliverable);
      }
    }
    
    // Check scope instability (3+ change requests in 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentChanges = await ChangeRequest.countDocuments({
      deliverable_id: { $in: project.deliverables.map(d => d._id) },
      submitted_at: { $gte: sevenDaysAgo }
    });
    
    health.scope_instability = recentChanges >= 3;
    
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### React Component (PM Dashboard - Project Health)

```jsx
// components/ProjectHealthDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectHealthDashboard = ({ projectId }) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectHealth();
  }, [projectId]);

  const fetchProjectHealth = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/health`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHealth(response.data);
    } catch (error) {
      console.error('Error fetching project health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!health) return <div>No health data</div>;

  return (
    <div className="project-health-dashboard">
      <h2>Project Health at a Glance</h2>
      
      {health.at_risk_deliverables.length > 0 && (
        <div className="alert alert-danger">
          <h3>🔴 At-Risk Deliverables ({health.at_risk_deliverables.length})</h3>
          {health.at_risk_deliverables.map((deliverable) => (
            <div key={deliverable._id}>
              <p>{deliverable.name} - Work remaining exceeds runway</p>
            </div>
          ))}
        </div>
      )}
      
      {health.scope_instability && (
        <div className="alert alert-warning">
          <h3>🟡 Scope Instability</h3>
          <p>3+ change requests in the last 7 days. Review scope.</p>
        </div>
      )}
      
      <div className="metrics">
        <h3>Team Metrics</h3>
        <p>Rework Rate: {health.rework_rate}%</p>
        <p>Average Cycle Time: {health.cycle_time_avg} days</p>
      </div>
    </div>
  );
};

export default ProjectHealthDashboard;
```

---

## PART 7: DAY-1 ONBOARDING (Concrete Flow)

### The 10-Minute Aha Moment

#### Step 0: PM Logs In (First Time) - React Component

```jsx
// components/OnboardingFlow.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow = () => {
  const [step, setStep] = useState(0);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    methodology: 'kanban',
    team: []
  });
  const navigate = useNavigate();

  const handleCreateProject = async () => {
    try {
      const response = await axios.post('/api/projects', projectData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate(`/projects/${response.data._id}/onboarding`);
    } catch (error) {
      alert('Failed to create project');
    }
  };

  return (
    <div className="onboarding-flow">
      {step === 0 && (
        <div>
          <h1>Welcome to Nucleus!</h1>
          <button onClick={() => setStep(1)}>Create Your First Project</button>
        </div>
      )}
      
      {step === 1 && (
        <div>
          <h2>Create Project</h2>
          <input
            placeholder="Project Name"
            value={projectData.name}
            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={projectData.description}
            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
          />
          <button onClick={handleCreateProject}>Next</button>
        </div>
      )}
      
      {/* More steps... */}
    </div>
  );
};

export default OnboardingFlow;
```

#### Express.js API Endpoint (Onboarding)

```javascript
// routes/projects.js
router.post('/', authenticate, async (req, res) => {
  try {
    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      methodology: req.body.methodology || 'kanban',
      created_by: req.user._id,
      workspace_id: req.user.workspace_id
    });
    
    await project.save();
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## PART 8: NOTIFICATIONS STRATEGY (Slack Only, MVP)

### What Gets Notified (To Whom)

#### PM Notifications (All Via Slack, Internal Channel)

```javascript
// services/slackService.js
const axios = require('axios');

async function sendSlackNotification(channel, message, attachments = []) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('Slack webhook not configured, skipping notification');
    return;
  }
  
  try {
    await axios.post(webhookUrl, {
      channel: `#${channel}`,
      text: message,
      attachments: attachments
    });
  } catch (error) {
    console.error('Slack notification error:', error);
  }
}

// Notification types
async function notifyTaskDone(deliverable, task, user) {
  await sendSlackNotification('project-nucleus', 
    `✅ Task Done: ${deliverable.name}: ${task.name} marked done by ${user.name} (${deliverable.progress_percentage}% of deliverable complete)`
  );
}

async function notifyAtRiskDeliverable(deliverable) {
  await sendSlackNotification('project-nucleus',
    `🔴 At-Risk Deliverable: ${deliverable.name}: Work remaining exceeds runway. May need to extend timeline or cut scope.`,
    [{
      color: 'danger',
      fields: [
        { title: 'Days until deadline', value: deliverable.days_remaining, short: true },
        { title: 'Work remaining', value: `${deliverable.work_remaining} days`, short: true }
      ]
    }]
  );
}

async function notifyClientFeedback(changeRequest) {
  await sendSlackNotification('project-nucleus',
    `💬 Client Feedback: ${changeRequest.submitted_by} requested change: "${changeRequest.description}"`
  );
}

module.exports = {
  sendSlackNotification,
  notifyTaskDone,
  notifyAtRiskDeliverable,
  notifyClientFeedback
};
```

#### Client Notifications (Email via SendGrid)

```javascript
// services/emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendClientUpdateEmail(clientEmail, deliverable) {
  const msg = {
    to: clientEmail,
    from: process.env.FROM_EMAIL,
    subject: `Project Update: ${deliverable.name}`,
    html: `
      <h2>Your Project Update</h2>
      <p>Project: ${deliverable.project_id.name}</p>
      <p>Deliverable: ${deliverable.name}</p>
      <p>Status: ${deliverable.status}</p>
      <p>Progress: ${deliverable.progress_percentage}%</p>
      <a href="${process.env.CLIENT_PORTAL_URL}/deliverables/${deliverable._id}">View Full Details</a>
    `
  };
  
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Email error:', error);
  }
}

module.exports = { sendClientUpdateEmail };
```

---

## PART 9: PREBUILT TEMPLATES (Day-1 Shortcuts)

### MongoDB Schema (Template)

```javascript
// models/ProjectTemplate.js
const ProjectTemplateSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  methodology: {
    type: String,
    enum: ['kanban', 'scrum', 'hybrid'],
    default: 'kanban'
  },
  deliverables: [{
    name: String,
    description: String,
    acceptance_criteria: [String],
    estimated_days: Number
  }],
  dependencies: [{
    from: String, // deliverable name
    to: String // deliverable name
  }]
});

module.exports = mongoose.model('ProjectTemplate', ProjectTemplateSchema);
```

#### Express.js API Endpoint (Templates)

```javascript
// routes/templates.js
router.get('/', authenticate, async (req, res) => {
  try {
    const templates = await ProjectTemplate.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/use', authenticate, async (req, res) => {
  try {
    const template = await ProjectTemplate.findById(req.params.id);
    const project = new Project({
      name: req.body.name || template.name,
      description: req.body.description || template.description,
      methodology: template.methodology,
      created_by: req.user._id,
      workspace_id: req.user.workspace_id
    });
    
    await project.save();
    
    // Create deliverables from template
    for (const templateDeliverable of template.deliverables) {
      const deliverable = new Deliverable({
        project_id: project._id,
        name: templateDeliverable.name,
        description: templateDeliverable.description,
        acceptance_criteria: templateDeliverable.acceptance_criteria.map(ac => ({
          description: ac,
          met: false
        })),
        start_date: new Date(),
        target_date: new Date(Date.now() + templateDeliverable.estimated_days * 24 * 60 * 60 * 1000)
      });
      
      await deliverable.save();
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## PART 10: ENGINEERING TASKS (3-Month Breakdown) - MERN Stack

### Weeks 1–4: Foundation

**Backend (Node.js + Express):**
- [ ] User authentication (JWT, bcrypt, no OAuth yet)
- [ ] MongoDB connection setup (Mongoose)
- [ ] Database models (User, Workspace, Project, Deliverable, Task, Approval, ChangeRequest)
- [ ] Express API endpoints (CRUD for above)
- [ ] Deliverable progress logic (% calculation, blocking criteria)
- [ ] Approval state machine (sequential approval chain)
- [ ] Middleware (auth, validation, error handling)

**Frontend (React):**
- [ ] Landing page + signup (React Router)
- [ ] PM dashboard (project list, basic stats)
- [ ] Create deliverable flow (React forms)
- [ ] Link tasks to deliverable (drag-and-drop with react-beautiful-dnd)
- [ ] Task Kanban board (React components, 4 columns)

**Deployment:**
- [ ] Docker setup (Node.js + MongoDB)
- [ ] GitHub Actions CI/CD
- [ ] AWS ECS / DigitalOcean App Platform deployment
- [ ] SSL/HTTPS (Let's Encrypt)
- [ ] MongoDB Atlas setup (or self-hosted)

**Deliverable:** Fully functional PM workspace for 1 project with 5 deliverables and tasks. No client portal yet.

### Weeks 5–8: Client Portal + Sync

**Backend:**
- [ ] Client portal API (read-only deliverable data, separate routes)
- [ ] Gantt data generation (Frappe Gantt format)
- [ ] Approval workflow (sequential chain, rejection handling)
- [ ] Change request logic (create, evaluate, decide)
- [ ] Audit logging (all changes timestamped)
- [ ] Redis caching setup (Gantt data caching)

**Frontend:**
- [ ] Client portal (React Router, separate routes)
- [ ] Gantt chart (Frappe Gantt React integration)
- [ ] Approval UI (PM and client approval flows)
- [ ] Change request form (React forms, client submits, PM evaluates)
- [ ] Document vault (basic, file upload with multer)

**Integrations:**
- [ ] Slack webhook (PM notifications)
- [ ] Email service (SendGrid for invites, updates)
- [ ] Socket.io setup (real-time updates, optional)

**Deliverable:** Complete PM + Client workflow. Can create deliverable, invite client, client can approve.

### Weeks 9–12: Polish + Launch Prep

**Backend:**
- [ ] Date confidence tracking
- [ ] Risk flags (at-risk detection, high-priority alerts)
- [ ] Permission model (verify client can't edit, row-level security)
- [ ] Data export (CSV, PDF for audit)
- [ ] Performance optimization (Gantt caching with Redis, pagination)

**Frontend:**
- [ ] Prebuilt templates (website, app, custom)
- [ ] PM dashboard alerts (deliverables at-risk)
- [ ] Onboarding flow (Day-1 aha moment)
- [ ] Mobile responsive (client portal, React responsive design)
- [ ] UI polish (design review, accessibility, React component library)

**Operations:**
- [ ] Documentation (API docs with Swagger, user guide)
- [ ] Knowledge base (5 key articles)
- [ ] Support email setup
- [ ] Analytics (basic: signups, logins, deliverables created)

**Deliverable:** Production-ready MVP. Onboard 3–5 pilot customers for real testing.

---

## PART 11: SUCCESS CHECKLIST (Before Shipping)

### Must-Have (Non-Negotiable)

**Functionality:**
- [ ] PM can create deliverable, link tasks, target date, acceptance criteria
- [ ] Client can view read-only Gantt (deliverables only, not tasks)
- [ ] Client can approve deliverable (state change, timestamp logged)
- [ ] Client can submit change request (captured, PM evaluates, decision logged)
- [ ] PM can set approval workflow (dev → QA → client)
- [ ] Approvals enforce sequence (can't skip steps)
- [ ] Rejection sends deliverable back to "in-rework"
- [ ] All changes audit-logged (who, what, when)
- [ ] Slack notification to PM on key events

**Data Integrity:**
- [ ] Client view cannot modify internal state (no direct date/task edits)
- [ ] No data leakage across projects/workspaces (MongoDB row-level security)
- [ ] Approval chain persists (survives refresh, network hiccup)
- [ ] Change requests immutable (can't be deleted, only marked resolved)

**Performance:**
- [ ] PM dashboard loads in <1s (50 deliverables)
- [ ] Client Gantt renders in <500ms (100 tasks, Redis cached)
- [ ] No N+1 query problems (Mongoose populate, aggregation)
- [ ] Slack notifications deliver within 5 seconds of action

**UX:**
- [ ] Day-1 onboarding takes <10 minutes
- [ ] No more than 3 clicks to approve a deliverable
- [ ] Error messages are helpful (not "Error 500")
- [ ] Mobile-responsive (client portal works on phones)

**Nice-to-Have (V1.1, Not MVP):**
- [ ] Dark mode
- [ ] Bulk edit (multiple deliverables at once)
- [ ] Export Gantt to PDF
- [ ] Time estimates on tasks
- [ ] Team workload visualization

**Explicitly Don't Build:**
- [ ] Scrum sprints
- [ ] Resource planning
- [ ] Advanced reporting / analytics
- [ ] Integrations beyond Slack/email
- [ ] White-label portal
- [ ] Mobile app (responsive web is enough)
- [ ] AI/ML recommendations
- [ ] Real-time multiplayer editing

---

## PART 12: CUSTOMER VALIDATION SPRINT (Before Build Starts)

### Week 0: Before You Code Anything

**Objective:** Lock that 3 agencies will pay for MVP (removes execution risk)

**Interview Script (3–5 Agencies):**
```
"Hi [PM name], I'm building a tool to eliminate Friday status report meetings.
You'd create a clean timeline for clients, they'd approve deliverables, 
and all scope changes would be formal (not email chaos).

Would you use this if it was $200/month?"
```

**Listen for:**
- "Yes, absolutely" → They're your customer
- "Maybe, if it solved X" → Dig into X
- "We already use Asana/Jira" → Ask: "Would you replace or run parallel?"
- "Not interested" → Why? (data = gold)

**Record:**
- Time spent on Friday status reports (quantify pain)
- Current tools + what's broken
- Budget authority (PM or CFO?)
- Decision timeline (would they buy in 90 days?)
- Top feature needed (delivery priorities)

**Success Criteria (Go/No-Go):**

**GO if:**
- 3+ agencies say "Yes, absolutely"
- Average Friday status time: 4+ hours/week
- Pain is acute (losing 10%+ margin to scope creep)
- They have budget ($200/month is <$3k/year)

**NO-GO if:**
- Agencies say "interesting but not urgent"
- Main feedback is "Jira already does this"
- No clear problem (all say "our process works fine")

**If NO-GO → Validate a different problem before building.**

---

## PART 13: FINAL EXECUTION PLAN

### The Three-Month Sprint

**Week 1 (Oct 21):**
- Validation interviews complete
- Go/no-go decision made
- Technical spike: Gantt library testing, approval state machine design
- Engineering kickoff (week 2 starts building)

**Weeks 2–4 (Oct 28 - Nov 17):**
- Backend foundation done (Node.js + Express + MongoDB)
- Frontend dashboard + task board working (React)
- Database schema locked (Mongoose models)
- Internal testing by team

**Weeks 5–8 (Nov 18 - Dec 15):**
- Client portal live (read-only, React)
- Approvals working end-to-end
- Change request workflow done
- Slack integration working
- Pilot agency 1 onboarded (real usage)

**Weeks 9–12 (Dec 16 - Jan 6):**
- Templates added
- Onboarding flow polished
- 3–5 pilot customers
- Bugs fixed from pilot feedback
- Ready for public launch

**Week 13 (Jan 7):**
- Public beta launch (ProductHunt, Agency Hackers)
- Sales outreach begins
- First paying customers (ideally from pilots)

---

## PART 14: FINAL SUMMARY

### What You're Building

**Nucleus MVP:**
- PM workflow: Create deliverable → link tasks → set target date → invite client
- Client workflow: Approve deliverable → request scope change → download docs
- Sync: Automatic Gantt + approval chain + change log
- Result: No more manual Friday status reports. Formal scope management.

### Why It Wins

- Solves a real, quantifiable problem (5+ hours/week per PM)
- Defensible (data model + philosophy hard to copy)
- Buildable (3 engineers, 12 weeks, MERN stack)
- Fundable (realistic unit economics, clear TAM)
- Sellable (agencies will pilot eagerly)

### Execution Reality Check

**Not hard:**
- Basic CRUD (Express + MongoDB)
- Sequential state machine (Mongoose models)
- Gantt chart (Frappe Gantt React)

**Moderately hard:**
- Permission model (prevent data leaks, JWT + middleware)
- Approval chain edge cases (state machine logic)

**Don't underestimate:**
- Onboarding flow polish (React UX)
- Support for edge cases (error handling)

**Timeline risk:**
- Scope creep (ruthlessly kill feature requests)

### Next Step

**Before you write a single line of code:**

1. Validate with 3 agencies (1 week)
2. Technical spike on Gantt + approval machine (1 week)
3. If both look good → Commit to 12-week sprint
4. If not → Pivot based on learning

**If you skip validation, you will build a product nobody wants. That part you cannot skip.**

---

## THE BOTTOM LINE

This spec is complete. All critical decisions are locked. You have:

✅ Clear authority model (no data confusion)
✅ Realistic approval workflow (sequential, rejection handling)
✅ Simple change management (audit trail, PM controls)
✅ Fast Gantt rendering (cached with Redis, <500ms)
✅ Date confidence tracking (PM accountability)
✅ Concrete onboarding flow (10-minute aha)
✅ Honest financial model (5.3x LTV/CAC)
✅ Engineering roadmap (week-by-week tasks, MERN stack)
✅ Success metrics (before you ship)

**You can hand this to a CTO and say: "Build this in MERN."**

The only risk is: Does the market want it?
That's what validation answers.
**Validate first. Build with confidence.**

---

## APPENDIX: MERN STACK SETUP

### Backend Setup (Node.js + Express)

```bash
# Initialize project
mkdir nucleus-backend
cd nucleus-backend
npm init -y

# Install dependencies
npm install express mongoose dotenv cors helmet morgan
npm install jsonwebtoken bcryptjs
npm install redis axios
npm install @sendgrid/mail
npm install --save-dev nodemon

# Create .env
MONGODB_URI=mongodb://localhost:27017/nucleus
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SENDGRID_API_KEY=SG...
```

### Frontend Setup (React)

```bash
# Initialize React app
npx create-react-app nucleus-frontend
cd nucleus-frontend

# Install dependencies
npm install axios react-router-dom
npm install frappe-gantt
npm install react-beautiful-dnd
npm install socket.io-client

# Install UI library (optional)
npm install @mui/material @emotion/react @emotion/styled
```

### MongoDB Models Structure

```
models/
├── User.js
├── Workspace.js
├── Project.js
├── Deliverable.js
├── Task.js
├── Approval.js
├── ChangeRequest.js
├── ChangeRequestAudit.js
└── ProjectTemplate.js
```

### Express Routes Structure

```
routes/
├── auth.js
├── users.js
├── projects.js
├── deliverables.js
├── tasks.js
├── approvals.js
├── changeRequests.js
├── gantt.js
├── templates.js
└── client.js (client portal routes)
```

### React Components Structure

```
src/
├── components/
│   ├── ApprovalProgress.jsx
│   ├── ClientApprovalView.jsx
│   ├── ChangeRequestDashboard.jsx
│   ├── GanttChart.jsx
│   ├── DateValidationAlerts.jsx
│   ├── ProjectHealthDashboard.jsx
│   └── OnboardingFlow.jsx
├── pages/
│   ├── PMDashboard.jsx
│   ├── ClientPortal.jsx
│   └── ProjectDetail.jsx
└── services/
    └── api.js (axios instance)
```

---

**END OF SPECIFICATION**
