# Document Hub - Complete Feature Specification & Design Prompt

## Overview

The **Document Hub** is a comprehensive document management system within the Software House ERP. It serves as the central repository for all organizational documents, combining document creation, file uploads, organization, collaboration, and workflow management in one unified interface.

**Purpose:** Enable organizations to create, organize, manage, approve, and track all their documents in a single, cloud-based system that replaces scattered files and ad-hoc document storage.

---

## Core Functionality

### 1. Document Library (Main Hub)

**What it does:** Displays all documents in a unified view, regardless of whether they were created in the system or uploaded as files.

**Features:**
- **Unified View:** Shows both created documents (from templates) and uploaded files (PDF, Word, Excel, PowerPoint, images, etc.) in one list
- **Multiple View Modes:**
  - **Grid View:** Card-based layout with document previews/icons
  - **List View:** Compact list with key information
  - **Table View:** Detailed table with sortable columns
- **Pagination:** Handles large document collections (20 per page)
- **Real-time Updates:** Documents appear immediately after creation/upload

**User Actions:**
- Click document to open/view
- Select multiple documents for bulk actions
- Delete documents
- Filter and search documents

---

### 2. Document Creation

**What it does:** Allows users to create new documents from templates or start with a blank document.

**Features:**
- **Template Selection Modal:** 
  - 7 pre-built business templates:
    - **Blank:** Empty document
    - **Proposal:** Project/service proposal template
    - **Contract:** Legal contract template
    - **Meeting Notes:** Meeting documentation template
    - **Project Brief:** Project brief template
    - **SOW (Statement of Work):** SOW template
    - **Invoice Cover:** Invoice cover letter template
  - Visual template picker with icons and descriptions
  - Click template to create new document
- **Rich Text Editor:** 
  - BlockNote-based WYSIWYG editor
  - Full formatting capabilities
  - Title editing
  - Auto-save (saves every 2 seconds after changes)
  - Manual save button
  - Keyboard shortcuts (Ctrl/Cmd + S to save)

**User Flow:**
1. Click "New Document" button
2. Modal opens showing templates
3. Select template or blank
4. Editor opens with template content (or empty)
5. Edit document
6. Auto-saves as you type
7. Can manually save
8. Can submit for review when ready

---

### 3. File Upload

**What it does:** Allows users to upload existing files (PDFs, Word docs, Excel, PowerPoint, images, etc.) to the document library.

**Features:**
- **Upload Button:** Prominent upload button in header
- **File Types Supported:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, images, TXT, ZIP, RAR
- **Upload Progress:** Shows uploading state
- **Automatic Processing:** Files are stored in cloud (S3) and metadata extracted
- **View Only:** Uploaded files cannot be edited in the editor (download only)

**User Flow:**
1. Click "Upload" button
2. Select file from computer
3. File uploads to cloud
4. Document appears in library
5. Can view/download but not edit

---

### 4. Organization & Structure

**What it does:** Helps users organize documents using folders and tags.

#### Folders
- **Create Folders:** Users can create folders to group related documents
- **Folder Sidebar:** 
  - Desktop: Permanent sidebar showing all folders
  - Mobile: Horizontal folder chips above filters
- **Folder Navigation:** Click folder to filter documents by that folder
- **Folder Management:**
  - Create new folders
  - Delete folders (with confirmation)
  - Folders persist across sessions
- **"All Documents" View:** Click to see all documents regardless of folder

#### Tags
- **Create Tags:** Users can create custom tags/labels
- **Tag Documents:** Tags can be assigned to documents (via API)
- **Tag Filtering:** Multi-select tag filter in filters panel
- **Tag Display:** Tags shown on document cards/list items (up to 3 visible, "+N" for more)
- **Tag Management:**
  - Create tags
  - Delete tags (removes from all documents)
  - Tags shown as chips in filters section

**User Flow:**
1. Create folder/tag in filters section
2. Assign folder/tag to document (when creating or editing)
3. Filter documents by folder/tag
4. View documents organized by structure

---

### 5. Search & Filtering

**What it does:** Helps users quickly find specific documents.

**Features:**
- **Search Bar:** 
  - Full-text search across document titles and content
  - Real-time filtering as you type
  - Clear button to reset search
- **Advanced Filters Panel:**
  - **Status Filter:** Draft, In Review, Approved, Archived
  - **Type Filter:** Created (in-system) vs Uploaded (files)
  - **Folder Filter:** Dropdown to filter by folder
  - **Tag Filter:** Multi-select dropdown to filter by tags
  - **Sort Options:** 
    - Last updated (default)
    - Created date
    - Title (alphabetical)
  - **Order:** Ascending/Descending
- **Filter Persistence:** Filters saved in URL, so they persist on refresh
- **Clear Filters:** One-click button to reset all filters

**User Flow:**
1. Type in search bar OR
2. Click "Filters" button
3. Select filter options
4. Documents update in real-time
5. Filters persist in URL

---

### 6. Document Lifecycle & Approval Workflow

**What it does:** Manages document states and approval process.

**Document States:**
- **Draft:** Initial state, document being created/edited
- **In Review:** Submitted for approval, waiting for reviewer
- **Approved:** Approved by reviewer, final state
- **Archived:** Archived documents (retained but not active)

**Approval Workflow:**
1. **Submit for Review:**
   - Document creator clicks "Submit for review" button
   - Document status changes to "In Review"
   - Document appears in approver's queue
   
2. **Approval Queue:**
   - Dedicated page showing all documents awaiting review
   - Shows document title, creator, last updated date
   - Approver can:
     - View document
     - Approve with optional comment
     - Reject with optional comment (returns to Draft)
   - Documents removed from queue after action

3. **Status Badges:** Visual indicators showing document status (color-coded)

**User Flow (Creator):**
1. Create/edit document
2. Click "Submit for review"
3. Document moves to "In Review" status
4. Waits for approval

**User Flow (Approver):**
1. Navigate to "Approval Queue"
2. See list of documents awaiting review
3. Click document to view
4. Approve or reject with comment
5. Document status updates

---

### 7. Document Editor

**What it does:** Rich text editor for creating and editing documents.

**Features:**
- **BlockNote Editor:** Modern block-based editor (similar to Notion)
- **Title Editing:** Editable title field at top
- **Auto-save:** Automatically saves changes every 2 seconds
- **Save Status Indicator:** Shows "Saving...", "Saved", or "Error"
- **Manual Save:** Save button for immediate save
- **Keyboard Shortcuts:** Ctrl/Cmd + S to save
- **Template Loading:** When creating from template, loads template content
- **Legacy HTML Support:** Can parse and convert old HTML documents

**Editor Actions:**
- **Save:** Manual save button
- **Submit for Review:** Only available for Draft documents
- **Export:** Download as HTML, Word, or PDF
- **Version History:** Access previous versions
- **Back Navigation:** Return to document hub

**User Flow:**
1. Open document (new or existing)
2. Edit title and content
3. Auto-saves as you type
4. Can manually save
5. Can submit for review
6. Can export document
7. Can view version history

---

### 8. Version History

**What it does:** Tracks and allows restoration of previous document versions.

**Features:**
- **Version List:** Shows all previous versions of a document
- **Version Details:** Shows when version was created, who created it
- **Restore Version:** Can restore any previous version
- **Version Drawer:** Side panel showing version history
- **Automatic Versioning:** New version created on each save

**User Flow:**
1. Click "History" button in editor
2. Version drawer opens showing all versions
3. Click "Restore" on any version
4. Document content reverts to that version
5. New version created from restore

---

### 9. Export & Download

**What it does:** Allows users to export documents in various formats.

**Features:**
- **Export Formats:**
  - **HTML:** Web-friendly format
  - **Word (.docx):** Microsoft Word format
  - **PDF:** Portable Document Format
- **Export Menu:** Dropdown menu in editor header
- **Download Uploaded Files:** Uploaded files can be downloaded directly
- **Safe Filename:** Automatically sanitizes filenames for download

**User Flow:**
1. Open document
2. Click export/download button
3. Select format (HTML/Word/PDF)
4. File downloads to computer

---

### 10. Audit Trail

**What it does:** Tracks all document activities for compliance and accountability.

**Features:**
- **Activity Log:** Shows all actions performed on documents
- **Tracked Actions:**
  - Viewed
  - Created
  - Edited
  - Submitted for review
  - Approved
  - Rejected
  - Archived
  - Restored
  - Deleted
- **Audit Details:**
  - Timestamp
  - User who performed action
  - Document affected
  - Optional comments
- **Audit Page:** Dedicated page showing all audit events
- **Pagination:** Handles large audit logs
- **Filtering:** Can filter by document or user

**User Flow:**
1. Navigate to "Audit Log" page
2. See chronological list of all document activities
3. Click document name to view document
4. See who did what and when

---

### 11. Bulk Operations

**What it does:** Allows users to perform actions on multiple documents at once.

**Features:**
- **Multi-select:** Checkboxes on each document
- **Select All:** Checkbox in header to select all visible documents
- **Bulk Delete:** Delete multiple documents at once
- **Selection Counter:** Shows how many documents are selected
- **Clear Selection:** Button to deselect all

**User Flow:**
1. Check boxes next to documents
2. Selection counter appears
3. Click "Delete" to remove selected documents
4. Confirmation before deletion

---

### 12. Document Metadata

**What it does:** Stores and displays information about each document.

**Metadata Fields:**
- **Title:** Document name (editable)
- **Type:** Created (in-system) or Uploaded (file)
- **Status:** Draft, In Review, Approved, Archived
- **Created Date:** When document was created
- **Updated Date:** Last modification time
- **Created By:** User who created the document
- **Folder:** Which folder document belongs to
- **Tags:** Tags assigned to document
- **Template:** Which template was used (if any)

**Display:**
- Metadata shown in document cards/list items
- Status badges with color coding
- Date formatting (relative or absolute)
- Creator information

---

## User Interface Components

### Main Hub Page (`DocumentsHub.js`)
- **Header:** Title, description, action buttons (Upload, New Document, Approval Queue, Audit Log)
- **Folder Sidebar:** Desktop-only sidebar with folder navigation
- **Search Bar:** Prominent search input
- **Filters Panel:** Collapsible panel with all filter options
- **View Mode Toggle:** Grid/List/Table view switcher
- **Document Grid/List/Table:** Main content area showing documents
- **Pagination:** Page navigation controls
- **Empty State:** Message when no documents found
- **Loading State:** Spinner while loading documents

### Template Selection Modal
- **Modal Overlay:** Backdrop with blur effect
- **Modal Container:** Centered modal with rounded corners
- **Header:** Title, description, close button
- **Template Grid:** Cards showing each template
- **Template Cards:** Icon, name, description, hover effects

### Document Editor (`DocumentEditor.js`)
- **Header Bar:** Back button, title input, save status, action buttons
- **Editor Area:** BlockNote editor taking full width
- **Toolbar:** Editor formatting toolbar (provided by BlockNote)
- **Version Drawer:** Side panel for version history
- **Export Menu:** Dropdown for export options

### Approval Queue (`ApprovalQueue.js`)
- **Header:** Title, description, back button
- **Document List:** Cards showing documents awaiting review
- **Action Buttons:** Approve/Reject with comment input
- **Empty State:** Message when no documents in queue

### Audit Log (`DocumentAuditView.js`)
- **Header:** Title, description, back button
- **Audit Table:** Table showing all audit events
- **Columns:** When, Action, User, Document, Comment
- **Pagination:** Page navigation
- **Empty State:** Message when no audit events

---

## Technical Details

### Storage
- **Cloud-Based:** All documents stored in cloud (S3)
- **No Local Storage:** No browser localStorage usage
- **Backend API:** RESTful API for all operations
- **File Storage:** Uploaded files stored in S3 with metadata in database

### API Endpoints
- `GET /documents` - List documents (with filters, pagination)
- `GET /documents/:id` - Get single document
- `POST /documents` - Create document
- `PATCH /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document
- `POST /documents/:id/submit-for-review` - Submit for review
- `POST /documents/:id/approve` - Approve document
- `POST /documents/:id/reject` - Reject document
- `POST /documents/upload` - Upload file
- `GET /documents/in-review` - Get approval queue
- `GET /documents/:id/versions` - Get version history
- `POST /documents/:id/versions/:versionId/restore` - Restore version
- `GET /documents/audit/log` - Get audit log
- `GET /documents/folders/list` - List folders
- `POST /documents/folders` - Create folder
- `DELETE /documents/folders/:id` - Delete folder
- `GET /documents/tags/list` - List tags
- `POST /documents/tags` - Create tag
- `DELETE /documents/tags/:id` - Delete tag

### Data Models

**Document:**
- `_id`: Unique identifier
- `title`: Document title
- `content`: Document content (BlockNote format or file reference)
- `type`: "created" or "uploaded"
- `status`: "draft", "in_review", "approved", "archived"
- `folderId`: Reference to folder
- `tags`: Array of tag IDs
- `templateId`: Template used (if any)
- `createdBy`: User reference
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `downloadUrl`: URL for uploaded files

**Folder:**
- `_id`: Unique identifier
- `name`: Folder name
- `parentId`: Parent folder (for hierarchy)
- `scope`: "org" or "employee"

**Tag:**
- `_id`: Unique identifier
- `name`: Tag name
- `color`: Optional color

**Version:**
- `_id`: Unique identifier
- `documentId`: Reference to document
- `content`: Document content at this version
- `createdBy`: User who created version
- `createdAt`: Version timestamp

**Audit Event:**
- `_id`: Unique identifier
- `action`: Action type (viewed, created, edited, etc.)
- `documentId`: Reference to document
- `userId`: User who performed action
- `comment`: Optional comment
- `createdAt`: Event timestamp

---

## User Roles & Permissions

### Current Implementation
- **All Users:** Can access Document Hub
- **All Users:** Can create documents
- **All Users:** Can upload files
- **All Users:** Can organize with folders/tags
- **All Users:** Can submit documents for review
- **All Users:** Can approve/reject documents (approval queue accessible to all)
- **All Users:** Can view audit log

### Future Considerations
- Role-based permissions (who can approve)
- Document-level sharing
- Folder-level permissions
- Admin-only template management

---

## Design Requirements

### Visual Style
- **Premium Feel:** High-quality, polished interface
- **Modern:** Contemporary design patterns
- **Professional:** Enterprise-grade appearance
- **Consistent:** Matches ERP design system
- **Accessible:** WCAG compliant, keyboard navigation

### Key Design Principles
1. **Clarity:** Information hierarchy is clear
2. **Efficiency:** Common actions are quick to access
3. **Feedback:** Clear status indicators and confirmations
4. **Forgiveness:** Undo/restore capabilities
5. **Discoverability:** Features are easy to find

### Responsive Design
- **Desktop First:** Optimized for desktop use
- **Tablet:** Adapts layout for tablets
- **Mobile:** Simplified interface for mobile devices
- **Breakpoints:** Standard responsive breakpoints

### States to Design
- **Loading:** Documents loading
- **Empty:** No documents found
- **Error:** API errors, network failures
- **Success:** Successful actions (saves, uploads)
- **Hover:** Interactive elements
- **Focus:** Keyboard navigation
- **Selected:** Multi-select state
- **Active:** Current filter/view mode

---

## User Flows

### Flow 1: Create New Document
1. User clicks "New Document"
2. Template modal opens
3. User selects template
4. Editor opens with template content
5. User edits document
6. Auto-saves as user types
7. User clicks "Submit for review"
8. Document status changes to "In Review"

### Flow 2: Upload File
1. User clicks "Upload" button
2. File picker opens
3. User selects file
4. File uploads (progress indicator)
5. File appears in document library
6. User can view/download file

### Flow 3: Organize Documents
1. User creates folder in filters section
2. User creates tag in filters section
3. User opens document
4. User assigns folder/tag (via API)
5. User filters by folder/tag
6. Documents filtered accordingly

### Flow 4: Approve Document
1. User navigates to "Approval Queue"
2. Sees list of documents awaiting review
3. Clicks document to view
4. Reviews document content
5. Clicks "Approve" with optional comment
6. Document status changes to "Approved"
7. Document removed from queue

### Flow 5: Search & Filter
1. User types in search bar
2. Documents filter in real-time
3. User clicks "Filters" button
4. Selects status, type, folder, tags
5. Documents update accordingly
6. User can clear filters

### Flow 6: View Version History
1. User opens document in editor
2. Clicks "History" button
3. Version drawer opens
4. Sees list of all versions
5. Clicks "Restore" on a version
6. Document content reverts
7. New version created

---

## Current Implementation Status

### ✅ Implemented Features
- Document library with grid/list/table views
- Document creation from templates
- Rich text editor (BlockNote)
- File upload
- Folders (create, delete, navigate)
- Tags (create, delete, filter)
- Search functionality
- Advanced filtering (status, type, folder, tags, sort)
- Approval workflow (submit, approve, reject)
- Version history (view, restore)
- Audit trail
- Export (HTML, Word, PDF)
- Auto-save
- Bulk delete
- Pagination
- URL state persistence

### 🔄 Areas for Improvement
- Template selection modal design (currently being redesigned)
- Folder hierarchy (currently flat, could support nesting)
- Tag assignment UI (currently API-only, needs UI)
- Document sharing (not implemented)
- Permissions system (all users have same access)
- Template management (admin UI for custom templates)
- Document preview (for uploaded files)
- Drag-and-drop upload
- Drag-and-drop folder organization
- Keyboard shortcuts for navigation
- Document templates customization

---

## Design Goals

The Document Hub should feel:
- **Intuitive:** Users understand how to use it immediately
- **Powerful:** Handles complex document management needs
- **Fast:** Quick to load, responsive interactions
- **Reliable:** Auto-save, version history, error handling
- **Beautiful:** Premium, polished visual design
- **Professional:** Enterprise-grade quality

---

## Success Metrics

A successful Document Hub design should:
1. Reduce time to find documents (via search/filters)
2. Increase document organization (via folders/tags)
3. Streamline approval process (via workflow)
4. Provide confidence (via version history, audit trail)
5. Feel delightful to use (via premium design)

---

*This specification serves as the complete reference for understanding and redesigning the Document Hub. Use this as the foundation for creating a world-class document management interface.*
