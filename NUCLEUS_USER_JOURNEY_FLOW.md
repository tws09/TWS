# Nucleus Project OS - Complete User Journey Flow Diagram

## Overview
This document provides a comprehensive visual guide to the Nucleus Project OS user journey, from initial login to project completion. It serves as both a user tutorial and developer reference.

---

## 🎯 User Journey Map

### **User Types:**
1. **Project Manager (PM)** - Internal team member managing projects
2. **Team Member** - Internal team member working on tasks
3. **Client** - External stakeholder viewing progress and approving deliverables

---

## 📊 Complete Flow Diagram (Mermaid)

```mermaid
flowchart TD
    Start([User Opens Application]) --> Login{User Authenticated?}
    Login -->|No| LoginScreen[Login Screen]
    LoginScreen --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateAuth{Valid Credentials?}
    ValidateAuth -->|No| ShowError[Show Error Message]
    ShowError --> EnterCredentials
    ValidateAuth -->|Yes| GenerateToken[Generate JWT Token]
    GenerateToken --> DashboardCheck{First Time User?}
    
    DashboardCheck -->|Yes| OnboardingFlow[Onboarding Flow]
    DashboardCheck -->|No| MainDashboard[Main Dashboard]
    
    %% ONBOARDING FLOW
    OnboardingFlow --> OnboardingStep1[Step 1: Create Workspace]
    OnboardingStep1 --> EnterWorkspaceName[Enter Workspace Name]
    EnterWorkspaceName --> CreateWorkspace[System: Create Workspace]
    CreateWorkspace --> OnboardingStep2[Step 2: Choose Template]
    OnboardingStep2 --> SelectTemplate{Select Template}
    SelectTemplate -->|Website| WebsiteTemplate[Website Template Selected]
    SelectTemplate -->|Mobile App| MobileTemplate[Mobile App Template Selected]
    SelectTemplate -->|Custom| CustomTemplate[Custom Template Selected]
    WebsiteTemplate --> OnboardingStep3[Step 3: Create Project]
    MobileTemplate --> OnboardingStep3
    CustomTemplate --> OnboardingStep3
    OnboardingStep3 --> EnterProjectName[Enter Project Name]
    EnterProjectName --> CreateProject[System: Create Project from Template]
    CreateProject --> TemplateDeliverables[System: Create 4 Deliverables with Tasks]
    TemplateDeliverables --> OnboardingComplete[Onboarding Complete!]
    OnboardingComplete --> MainDashboard
    
    %% MAIN DASHBOARD
    MainDashboard --> DashboardOptions{What to do?}
    
    %% CREATE NEW PROJECT FLOW
    DashboardOptions -->|Create Project| CreateProjectFlow[Create Project Flow]
    CreateProjectFlow --> SelectWorkspace[Select Workspace]
    SelectWorkspace --> VerifyWorkspaceAccess{User has Workspace Access?}
    VerifyWorkspaceAccess -->|No| AccessDenied[Access Denied - 403]
    AccessDenied --> MainDashboard
    VerifyWorkspaceAccess -->|Yes| ProjectForm[Project Creation Form]
    ProjectForm --> EnterProjectDetails[Enter: Name, Description, Dates]
    EnterProjectDetails --> ChooseTemplate{Use Template?}
    ChooseTemplate -->|Yes| SelectTemplateType[Select Template Type]
    SelectTemplateType --> CreateFromTemplate[System: Create Project + Deliverables + Tasks]
    ChooseTemplate -->|No| CreateEmptyProject[System: Create Empty Project]
    CreateFromTemplate --> ProjectCreated[Project Created Successfully]
    CreateEmptyProject --> ProjectCreated
    ProjectCreated --> ProjectDashboard[Project Dashboard]
    
    %% MANAGE DELIVERABLES FLOW
    DashboardOptions -->|View Projects| ProjectsList[Projects List]
    ProjectsList --> SelectProject[Click on Project]
    SelectProject --> ProjectDashboard
    ProjectDashboard --> ProjectActions{Project Actions}
    ProjectActions -->|Create Deliverable| CreateDeliverableFlow[Create Deliverable Flow]
    ProjectActions -->|View Deliverables| ViewDeliverables[View Deliverables List]
    ProjectActions -->|View Analytics| AnalyticsFlow[Analytics Flow]
    
    CreateDeliverableFlow --> DeliverableForm[Deliverable Form]
    DeliverableForm --> EnterDeliverableDetails[Enter: Name, Description, Start Date, Target Date]
    EnterDeliverableDetails --> AddAcceptanceCriteria[Add Acceptance Criteria]
    AddAcceptanceCriteria --> SubmitDeliverable[Click 'Create Deliverable']
    SubmitDeliverable --> ValidateDeliverable{Valid Data?}
    ValidateDeliverable -->|No| ShowValidationErrors[Show Validation Errors]
    ShowValidationErrors --> DeliverableForm
    ValidateDeliverable -->|Yes| CreateDeliverable[System: Create Deliverable]
    CreateDeliverable --> SetStatusCreated[System: Set Status = 'created']
    SetStatusCreated --> DeliverableCreated[Deliverable Created]
    DeliverableCreated --> DeliverableDashboard[Deliverable Dashboard]
    
    %% TASK MANAGEMENT FLOW
    DeliverableDashboard --> DeliverableActions{Deliverable Actions}
    DeliverableActions -->|Link Tasks| LinkTasksFlow[Link Tasks Flow]
    DeliverableActions -->|Create Approval Chain| ApprovalFlow[Approval Flow]
    DeliverableActions -->|Update Status| StatusUpdateFlow[Status Update Flow]
    
    LinkTasksFlow --> TasksList[View Available Tasks]
    TasksList --> SelectTasks[Select Tasks to Link]
    SelectTasks --> LinkTasks[Click 'Link Tasks']
    LinkTasks --> SystemLinkTasks[System: Link Tasks to Deliverable]
    SystemLinkTasks --> UpdateTaskMilestone[System: Set task.milestoneId = deliverableId]
    UpdateTaskMilestone --> CalculateProgress[System: Auto-calculate Deliverable Progress]
    CalculateProgress --> TasksLinked[Tasks Linked Successfully]
    TasksLinked --> DeliverableDashboard
    
    %% CREATE TASK FLOW
    ProjectDashboard -->|Create Task| CreateTaskFlow[Create Task Flow]
    CreateTaskFlow --> TaskForm[Task Form]
    TaskForm --> EnterTaskDetails[Enter: Title, Description, Assignee, Due Date]
    EnterTaskDetails --> LinkToDeliverable{Link to Deliverable?}
    LinkToDeliverable -->|Yes| SelectDeliverable[Select Deliverable]
    LinkToDeliverable -->|No| CreateTaskOnly[Create Task Only]
    SelectDeliverable --> CreateTaskWithDeliverable[System: Create Task + Link to Deliverable]
    CreateTaskWithDeliverable --> SetMilestoneId[System: Set task.milestoneId]
    SetMilestoneId --> UpdateDeliverableProgress[System: Auto-update Deliverable Progress]
    CreateTaskOnly --> CreateTask[System: Create Task]
    CreateTask --> TaskCreated[Task Created]
    UpdateDeliverableProgress --> TaskCreated
    TaskCreated --> TaskDashboard[Task Dashboard]
    
    %% TASK STATUS UPDATE FLOW
    TaskDashboard --> UpdateTaskStatus[Update Task Status]
    UpdateTaskStatus --> SelectNewStatus{Select New Status}
    SelectNewStatus -->|Completed| MarkCompleted[Mark as Completed]
    SelectNewStatus -->|In Progress| MarkInProgress[Mark as In Progress]
    MarkCompleted --> SaveTaskStatus[System: Update Task Status]
    MarkInProgress --> SaveTaskStatus
    SaveTaskStatus --> CheckMilestone{Task has milestoneId?}
    CheckMilestone -->|Yes| RecalculateProgress[System: Recalculate Deliverable Progress]
    CheckMilestone -->|No| TaskUpdated[Task Updated]
    RecalculateProgress --> CheckAllTasksComplete{All Tasks Complete?}
    CheckAllTasksComplete -->|Yes| AutoUpdateStatus[System: Auto-update Deliverable Status to 'ready_approval']
    CheckAllTasksComplete -->|No| TaskUpdated
    AutoUpdateStatus --> TaskUpdated
    TaskUpdated --> TaskDashboard
    
    %% APPROVAL WORKFLOW FLOW
    ApprovalFlow --> ApprovalForm[Approval Chain Form]
    ApprovalForm --> EnterApprovers[Enter: Dev Lead, QA Lead, Client Email]
    EnterApprovers --> CreateApprovalChain[Click 'Create Approval Chain']
    CreateApprovalChain --> SystemCreateChain[System: Create Sequential Approval Chain]
    SystemCreateChain --> Step1[Step 1: Dev Lead Approval]
    SystemCreateChain --> Step2[Step 2: QA Lead Approval]
    SystemCreateChain --> Step3[Step 3: Client Approval]
    Step1 --> ApprovalChainCreated[Approval Chain Created]
    ApprovalChainCreated --> DeliverableDashboard
    
    %% INTERNAL APPROVAL FLOW
    DeliverableDashboard --> ViewApprovals[View Approval Status]
    ViewApprovals --> ApprovalList[Approval Steps List]
    ApprovalList --> ClickApprovalStep[Click on Approval Step]
    ClickApprovalStep --> CheckCanApprove{Can User Approve?}
    CheckCanApprove -->|No| ApprovalDenied[Access Denied - Not authorized]
    CheckCanApprove -->|Yes| CheckPreviousStep{Previous Step Approved?}
    CheckPreviousStep -->|No| SequentialError[Error: Previous step must be approved]
    CheckPreviousStep -->|Yes| ApprovalFormInternal[Approval Form]
    ApprovalFormInternal --> AddNotes[Add Approval Notes]
    AddNotes --> SubmitApproval[Click 'Approve']
    SubmitApproval --> SystemApprove[System: Mark Step as Approved]
    SystemApprove --> CheckNextStep{Is Next Step Available?}
    CheckNextStep -->|Yes| NotifyNextApprover[System: Notify Next Approver via Slack]
    CheckNextStep -->|No| CheckAllApproved{All Steps Approved?}
    CheckAllApproved -->|Yes| UpdateDeliverableStatus[System: Update Deliverable Status = 'approved']
    CheckAllApproved -->|No| ApprovalComplete[Approval Step Complete]
    UpdateDeliverableStatus --> ApprovalComplete
    ApprovalComplete --> DeliverableDashboard
    
    %% CLIENT PORTAL FLOW
    DashboardOptions -->|Client Portal| ClientPortalFlow[Client Portal Flow]
    ClientPortalFlow --> VerifyClientAccess{User is Client?}
    VerifyClientAccess -->|No| ClientAccessDenied[Access Denied - Not a client]
    VerifyClientAccess -->|Yes| ClientDashboard[Client Dashboard]
    ClientDashboard --> ClientActions{Client Actions}
    ClientActions -->|View Gantt| ClientGantt[View Gantt Chart - Deliverables Only]
    ClientActions -->|View Deliverables| ClientDeliverables[View Deliverables List]
    ClientActions -->|Approve Deliverable| ClientApprovalFlow[Client Approval Flow]
    ClientActions -->|Submit Change Request| ChangeRequestFlow[Change Request Flow]
    
    ClientGantt --> GanttData[System: Return Deliverables Timeline]
    GanttData --> DisplayGantt[Display Gantt Chart]
    
    ClientDeliverables --> DeliverableList[System: Return Deliverables for Project]
    DeliverableList --> DisplayDeliverables[Display Deliverables]
    DisplayDeliverables --> ClickDeliverable[Click on Deliverable]
    ClickDeliverable --> DeliverableDetails[Deliverable Details View]
    DeliverableDetails --> ViewApprovalStatus[View Approval Status]
    
    %% CLIENT APPROVAL FLOW
    ClientApprovalFlow --> SelectDeliverableToApprove[Select Deliverable]
    SelectDeliverableToApprove --> CheckApprovalReady{Deliverable Status = 'ready_approval'?}
    CheckApprovalReady -->|No| NotReadyForApproval[Error: Not ready for approval]
    CheckApprovalReady -->|Yes| CheckClientStep{Is Client Step Ready?}
    CheckClientStep -->|No| PreviousStepsPending[Error: Previous steps must be approved]
    CheckClientStep -->|Yes| ClientApprovalForm[Client Approval Form]
    ClientApprovalForm --> ClientDecision{Approve or Reject?}
    ClientDecision -->|Approve| ClientApprove[Click 'Approve']
    ClientDecision -->|Reject| ClientReject[Click 'Reject']
    ClientApprove --> SystemClientApprove[System: Mark Client Step as Approved]
    ClientReject --> SystemClientReject[System: Mark Client Step as Rejected]
    SystemClientApprove --> CheckAllStepsApproved{All Steps Approved?}
    SystemClientReject --> UpdateStatusRejected[System: Update Status = 'in_rework']
    CheckAllStepsApproved -->|Yes| UpdateStatusApproved[System: Update Status = 'approved']
    CheckAllStepsApproved -->|No| NotifyPM[System: Notify PM via Slack]
    UpdateStatusApproved --> NotifyPM
    UpdateStatusRejected --> NotifyPM
    NotifyPM --> ApprovalCompleteClient[Approval Complete]
    ApprovalCompleteClient --> ClientDashboard
    
    %% CHANGE REQUEST FLOW
    ChangeRequestFlow --> ChangeRequestForm[Change Request Form]
    ChangeRequestForm --> EnterChangeDescription[Enter Change Description]
    EnterChangeDescription --> SubmitChangeRequest[Click 'Submit Change Request']
    SubmitChangeRequest --> SystemCreateChangeRequest[System: Create Change Request]
    SystemCreateChangeRequest --> SetStatusSubmitted[System: Set Status = 'submitted']
    SetStatusSubmitted --> NotifyPMChangeRequest[System: Notify PM via Slack]
    NotifyPMChangeRequest --> ChangeRequestSubmitted[Change Request Submitted]
    ChangeRequestSubmitted --> ClientDashboard
    
    %% PM EVALUATION FLOW
    DashboardOptions -->|View Change Requests| ChangeRequestsList[Change Requests List]
    ChangeRequestsList --> SelectChangeRequest[Select Change Request]
    SelectChangeRequest --> ChangeRequestDetails[Change Request Details]
    ChangeRequestDetails --> EvaluateChangeRequest[Click 'Evaluate']
    EvaluateChangeRequest --> EvaluationForm[Evaluation Form]
    EvaluationForm --> EnterEvaluation[Enter: Effort Days, Cost, Timeline Impact]
    EnterEvaluation --> AddRecommendation[Add Recommendation: Accept/Reject]
    AddRecommendation --> SubmitEvaluation[Click 'Submit Evaluation']
    SubmitEvaluation --> SystemEvaluate[System: Update Status = 'evaluated']
    SystemEvaluate --> NotifyClient[System: Notify Client via Slack]
    NotifyClient --> ChangeRequestEvaluated[Change Request Evaluated]
    ChangeRequestEvaluated --> ChangeRequestsList
    
    %% CLIENT DECISION ON CHANGE REQUEST
    ClientDashboard --> ViewChangeRequests[View Change Requests]
    ViewChangeRequests --> ClientChangeRequestList[Change Requests List]
    ClientChangeRequestList --> SelectClientChangeRequest[Select Change Request]
    SelectClientChangeRequest --> ViewEvaluation[View PM Evaluation]
    ViewEvaluation --> ClientDecisionChange{Accept or Reject?}
    ClientDecisionChange -->|Accept| AcceptChange[Click 'Accept']
    ClientDecisionChange -->|Reject| RejectChange[Click 'Reject']
    AcceptChange --> SystemAcceptChange[System: Update Status = 'accepted']
    RejectChange --> SystemRejectChange[System: Update Status = 'rejected']
    SystemAcceptChange --> UpdateDeliverableDates[System: Update Deliverable Target Date]
    UpdateDeliverableDates --> NotifyPMAccepted[System: Notify PM via Slack]
    SystemRejectChange --> NotifyPMRejected[System: Notify PM via Slack]
    NotifyPMAccepted --> ChangeRequestComplete[Change Request Complete]
    NotifyPMRejected --> ChangeRequestComplete
    ChangeRequestComplete --> ClientDashboard
    
    %% ANALYTICS FLOW
    AnalyticsFlow --> AnalyticsDashboard[Analytics Dashboard]
    AnalyticsDashboard --> AnalyticsOptions{Select Analytics View}
    AnalyticsOptions -->|Workspace Stats| WorkspaceStats[Workspace Statistics]
    AnalyticsOptions -->|Project Summary| ProjectSummary[Project Summary]
    AnalyticsOptions -->|At-Risk Deliverables| AtRiskDeliverables[At-Risk Deliverables]
    AnalyticsOptions -->|Pending Approvals| PendingApprovals[Pending Approvals]
    AnalyticsOptions -->|Metrics| WorkspaceMetrics[Workspace Metrics]
    
    WorkspaceStats --> SystemGetStats[System: Calculate Statistics]
    SystemGetStats --> DisplayStats[Display: Projects, Deliverables, Completion Rate]
    
    ProjectSummary --> SystemGetSummary[System: Get Project Summary]
    SystemGetSummary --> DisplaySummary[Display: Deliverables, Progress, Status]
    
    AtRiskDeliverables --> SystemGetAtRisk[System: Find At-Risk Deliverables]
    SystemGetAtRisk --> DisplayAtRisk[Display: Deliverables with Risk Indicators]
    
    PendingApprovals --> SystemGetPending[System: Get Pending Approvals]
    SystemGetPending --> DisplayPending[Display: Deliverables Awaiting Approval]
    
    WorkspaceMetrics --> SystemGetMetrics[System: Calculate Metrics]
    SystemGetMetrics --> DisplayMetrics[Display: Average Approval Time, On-Time Rate]
    
    DisplayStats --> AnalyticsDashboard
    DisplaySummary --> AnalyticsDashboard
    DisplayAtRisk --> AnalyticsDashboard
    DisplayPending --> AnalyticsDashboard
    DisplayMetrics --> AnalyticsDashboard
    
    %% BATCH OPERATIONS FLOW
    DashboardOptions -->|Batch Operations| BatchOperationsFlow[Batch Operations Flow]
    BatchOperationsFlow --> BatchOptions{Select Batch Operation}
    BatchOptions -->|Update Progress| BatchUpdateProgress[Batch Update Progress]
    BatchOptions -->|Link Tasks| BatchLinkTasks[Batch Link Tasks]
    BatchOptions -->|Create Approvals| BatchCreateApprovals[Batch Create Approvals]
    
    BatchUpdateProgress --> SelectDeliverables[Select Deliverables]
    SelectDeliverables --> ExecuteBatchUpdate[Click 'Update Progress']
    ExecuteBatchUpdate --> SystemBatchUpdate[System: Recalculate Progress for All]
    SystemBatchUpdate --> BatchComplete[Batch Operation Complete]
    
    BatchLinkTasks --> SelectDeliverableForBatch[Select Deliverable]
    SelectDeliverableForBatch --> SelectMultipleTasks[Select Multiple Tasks]
    SelectMultipleTasks --> ExecuteBatchLink[Click 'Link Tasks']
    ExecuteBatchLink --> SystemBatchLink[System: Link All Tasks]
    SystemBatchLink --> BatchComplete
    
    BatchCreateApprovals --> SelectDeliverablesForApproval[Select Deliverables]
    SelectDeliverablesForApproval --> EnterApproverDetails[Enter Approver Details]
    EnterApproverDetails --> ExecuteBatchApproval[Click 'Create Approval Chains']
    ExecuteBatchApproval --> SystemBatchApproval[System: Create Approval Chains]
    SystemBatchApproval --> BatchComplete
    
    BatchComplete --> MainDashboard
    
    %% DATE VALIDATION FLOW
    DeliverableDashboard --> ValidateDate[Validate Deliverable Date]
    ValidateDate --> DateValidationForm[Date Validation Form]
    DateValidationForm --> EnterConfidence[Enter Confidence Level: High/Medium/Low]
    EnterConfidence --> AddValidationNotes[Add Validation Notes]
    AddValidationNotes --> SubmitValidation[Click 'Submit Validation']
    SubmitValidation --> SystemValidateDate[System: Record Validation]
    SystemValidateDate --> UpdateConfidence[System: Update Date Confidence Score]
    UpdateConfidence --> ValidationComplete[Date Validation Complete]
    ValidationComplete --> DeliverableDashboard
    
    %% END STATES
    MainDashboard --> Logout[Logout]
    Logout --> End([Session Ended])
    
    style Start fill:#e1f5ff
    style End fill:#ffe1f5
    style LoginScreen fill:#fff4e1
    style MainDashboard fill:#e1ffe1
    style ProjectDashboard fill:#e1ffe1
    style DeliverableDashboard fill:#e1ffe1
    style ClientDashboard fill:#e1ffe1
    style AnalyticsDashboard fill:#e1ffe1
    style OnboardingFlow fill:#f0e1ff
    style ApprovalFlow fill:#ffe1f0
    style ChangeRequestFlow fill:#ffe1f0
```

---

## 📋 Detailed Step-by-Step User Journeys

### **Journey 1: First-Time User Onboarding**

```
1. User opens application
   → System: Show login screen

2. User enters credentials
   → System: Validate credentials
   → System: Generate JWT token

3. System detects first-time user
   → System: Redirect to onboarding flow

4. Step 1: Create Workspace
   → User: Enters workspace name "Gamma Tech Solutions"
   → System: Creates workspace with user as owner
   → System: Sets default settings

5. Step 2: Choose Template
   → User: Selects "Website" template
   → System: Shows template preview

6. Step 3: Create Project
   → User: Enters project name "Client Portal App"
   → System: Creates project from template
   → System: Creates 4 deliverables automatically
   → System: Creates tasks for each deliverable
   → System: Links tasks to deliverables

7. Onboarding Complete
   → System: Shows success message
   → System: Redirects to main dashboard
```

---

### **Journey 2: Project Manager - Create Deliverable**

```
1. User clicks "Create Project" on dashboard
   → System: Shows workspace selection

2. User selects workspace
   → System: Verifies workspace access
   → System: Shows project creation form

3. User chooses "Website" template
   → System: Pre-fills deliverables and tasks
   → System: Creates project with 4 deliverables

4. User clicks on project
   → System: Shows project dashboard

5. User clicks "Create Deliverable"
   → System: Shows deliverable form

6. User enters:
   - Name: "Authentication System"
   - Description: "User login and registration"
   - Start Date: 2024-01-01
   - Target Date: 2024-01-31
   - Acceptance Criteria: "User can register with email"
   → System: Validates input

7. User clicks "Create Deliverable"
   → System: Creates deliverable
   → System: Sets status = 'created'
   → System: Shows success message

8. User sees deliverable in list
   → System: Displays deliverable with status badge
```

---

### **Journey 3: Team Member - Complete Task**

```
1. User logs in
   → System: Shows dashboard with assigned tasks

2. User clicks on task
   → System: Shows task details

3. User updates task status to "In Progress"
   → System: Updates task status
   → System: Checks if task is linked to deliverable (milestoneId)
   → System: If linked, recalculates deliverable progress

4. User completes task
   → User: Marks task as "Completed"
   → System: Updates task status
   → System: Sets task.completedDate
   → System: Recalculates deliverable progress

5. System checks if all tasks are complete
   → System: If all tasks complete, auto-updates deliverable status to 'ready_approval'
   → System: Notifies PM via Slack

6. User sees updated progress
   → System: Shows deliverable progress percentage updated
```

---

### **Journey 4: PM - Create Approval Chain**

```
1. PM clicks on deliverable
   → System: Shows deliverable dashboard

2. PM clicks "Create Approval Chain"
   → System: Shows approval form

3. PM enters:
   - Dev Lead: User A
   - QA Lead: User B
   - Client Email: client@example.com
   → System: Validates approvers exist

4. PM clicks "Create Approval Chain"
   → System: Creates sequential approval chain:
     - Step 1: Dev Lead (order: 1)
     - Step 2: QA Lead (order: 2)
     - Step 3: Client (order: 3)
   → System: Sets all steps to 'pending'
   → System: Sets can_proceed = false for steps 2 and 3

5. System notifies Dev Lead
   → System: Sends Slack notification
   → System: Shows approval request in dashboard

6. PM sees approval chain created
   → System: Displays approval steps with status badges
```

---

### **Journey 5: Internal Team - Approve Step**

```
1. Dev Lead logs in
   → System: Shows dashboard with pending approvals

2. Dev Lead clicks on approval
   → System: Shows deliverable details
   → System: Shows approval step information

3. Dev Lead reviews deliverable
   → System: Shows deliverable details, tasks, progress

4. Dev Lead clicks "Approve"
   → System: Checks if previous step is approved (Step 1, so no previous)
   → System: Validates user can approve (is Dev Lead)
   → System: Marks step as 'approved'
   → System: Sets can_proceed = true for Step 2
   → System: Notifies QA Lead via Slack

5. QA Lead receives notification
   → System: Shows approval request in dashboard

6. QA Lead clicks "Approve"
   → System: Checks if Step 1 is approved (yes)
   → System: Marks Step 2 as 'approved'
   → System: Sets can_proceed = true for Step 3
   → System: Notifies Client via Slack

7. System shows approval progress
   → System: Displays 2/3 steps approved
```

---

### **Journey 6: Client - Approve Deliverable**

```
1. Client logs in
   → System: Verifies client role
   → System: Shows client portal dashboard

2. Client clicks "View Deliverables"
   → System: Shows deliverables for their projects only
   → System: Filters out internal tasks

3. Client clicks on deliverable
   → System: Shows deliverable details (read-only)
   → System: Shows approval status

4. Client sees "Approve" button
   → System: Checks if deliverable status = 'ready_approval'
   → System: Checks if previous steps are approved (yes)
   → System: Enables approve button

5. Client clicks "Approve"
   → System: Marks client step as 'approved'
   → System: Checks if all steps are approved (yes)
   → System: Updates deliverable status = 'approved'
   → System: Notifies PM via Slack

6. Client sees success message
   → System: Shows "Deliverable approved successfully"
   → System: Updates deliverable status badge
```

---

### **Journey 7: Client - Submit Change Request**

```
1. Client views deliverable
   → System: Shows deliverable details

2. Client clicks "Request Change"
   → System: Shows change request form

3. Client enters change description:
   "Add password strength meter to registration form"
   → System: Validates input

4. Client clicks "Submit Change Request"
   → System: Creates change request
   → System: Sets status = 'submitted'
   → System: Notifies PM via Slack

5. PM receives notification
   → System: Shows change request in dashboard

6. PM clicks "Evaluate Change Request"
   → System: Shows evaluation form

7. PM enters:
   - Effort: 2 days
   - Cost: $1,200
   - Timeline Impact: +2 days
   - Recommendation: Accept
   → System: Updates status = 'evaluated'
   → System: Notifies client via Slack

8. Client receives notification
   → System: Shows evaluation in dashboard

9. Client clicks "Accept"
   → System: Updates status = 'accepted'
   → System: Updates deliverable target date (+2 days)
   → System: Notifies PM via Slack

10. System updates deliverable
    → System: Shows new target date
    → System: Recalculates at-risk status
```

---

### **Journey 8: PM - View Analytics**

```
1. PM clicks "Analytics" on dashboard
   → System: Shows analytics dashboard

2. PM clicks "Workspace Statistics"
   → System: Calculates statistics:
     - Total projects: 5
     - Total deliverables: 20
     - Completed deliverables: 12
     - On-time delivery rate: 85%
   → System: Displays statistics with charts

3. PM clicks "At-Risk Deliverables"
   → System: Finds deliverables with:
     - Target date < 7 days away
     - Progress < 50%
   → System: Displays list with risk indicators

4. PM clicks "Pending Approvals"
   → System: Finds deliverables with status = 'ready_approval'
   → System: Shows list with approval step information

5. PM clicks "Workspace Metrics"
   → System: Calculates:
     - Average approval time: 2.5 days
     - On-time delivery rate: 85%
     - Change request acceptance rate: 60%
   → System: Displays metrics dashboard
```

---

## 🎨 Visual Flow Summary

### **Color Coding:**
- 🟦 **Blue**: Start/End points
- 🟨 **Yellow**: Login/Authentication
- 🟩 **Green**: Dashboards/Main screens
- 🟪 **Purple**: Onboarding flow
- 🟥 **Red/Pink**: Approval/Change request flows
- ⬜ **White**: System processes

### **Flow Patterns:**
1. **Linear Flow**: Login → Dashboard → Action → Result
2. **Decision Points**: Yes/No branches (diamond shapes)
3. **System Processes**: Rounded rectangles
4. **User Actions**: Rectangles
5. **End States**: Rounded rectangles with double border

---

## 📖 Usage Guide

### **For Users:**
- Follow the flowchart from top to bottom
- Each box represents a step you take or a screen you see
- Decision points (diamonds) show where you make choices
- System processes happen automatically in the background

### **For Developers:**
- Each "System:" action maps to an API endpoint
- Decision points map to validation logic
- Error states show validation failures
- Success states show successful operations

### **For Stakeholders:**
- The diagram shows the complete user experience
- It demonstrates all features and workflows
- It shows how different user types interact with the system
- It highlights automation and system intelligence

---

## 🔄 Key Workflows Highlighted

1. **Onboarding**: 10-minute quick start
2. **Project Creation**: Template-based or custom
3. **Task Management**: Creation, linking, completion
4. **Approval Workflow**: Sequential, multi-step
5. **Change Requests**: Client → PM → Client cycle
6. **Client Portal**: Read-only, approval-focused
7. **Analytics**: Real-time insights and reporting
8. **Batch Operations**: Efficiency tools for PMs

---

## ✅ Completion Checklist

- [x] Authentication flow
- [x] Onboarding flow
- [x] Project creation flow
- [x] Deliverable management flow
- [x] Task management flow
- [x] Approval workflow flow
- [x] Change request flow
- [x] Client portal flow
- [x] Analytics flow
- [x] Batch operations flow
- [x] Date validation flow
- [x] Error handling flows
- [x] System process documentation

---

**This diagram serves as a complete reference for understanding the Nucleus Project OS user journey from login to project completion.**
