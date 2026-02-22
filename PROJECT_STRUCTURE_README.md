# TWS Project Structure Documentation

This directory contains comprehensive documentation about the TWS (The Wolf Stack) project structure, including file indexing, dependency mapping, and architectural flow diagrams.

## 📁 Generated Files

### 1. **PROJECT_FOLDER_STRUCTURE_DIAGRAM.md** ⭐ **START HERE - ACTUAL FOLDER STRUCTURE**
   - **Purpose**: Shows the **actual folder hierarchy** and file organization
   - **Contents**:
     - Complete folder tree structure
     - Real directory paths (e.g., `features/admin/pages/SupraAdmin/`)
     - Frontend folder organization by feature
     - Backend folder organization by type
     - Key folder patterns and conventions
   - **Best for**: Finding files, understanding folder organization, navigating the codebase

### 2. **PROJECT_ARCHITECTURE_FLOW_DIAGRAM.md** ⭐ **ARCHITECTURE OVERVIEW**
   - **Purpose**: Visual architectural overview with Mermaid diagrams
   - **Contents**:
     - High-level architecture diagram
     - Detailed frontend structure
     - Detailed backend structure
     - Frontend-backend integration flow
     - Module organization
     - Data flow examples (Authentication, Tenant Creation)
     - Actual folder structure section
   - **Best for**: Understanding the overall system architecture and how components connect

### 3. **PROJECT_STRUCTURE_DIAGRAM.md**
   - **Purpose**: Detailed dependency graph showing file relationships
   - **Contents**:
     - Mermaid diagram with all file categories
     - Visual representation of dependencies
     - Color-coded frontend/backend sections
   - **Best for**: Exploring specific file relationships and dependencies

### 3. **PROJECT_STRUCTURE_INDEX.md**
   - **Purpose**: Comprehensive text-based file index
   - **Contents**:
     - Summary statistics
     - Complete file listings by category
     - Files organized by frontend/backend
     - Key dependencies listing
   - **Best for**: Finding specific files and understanding file organization

### 4. **PROJECT_STRUCTURE_INDEX.json**
   - **Purpose**: Machine-readable project index
   - **Contents**:
     - JSON format with all file metadata
     - Dependency relationships
     - File categories and types
   - **Best for**: Programmatic analysis, tooling, or further processing

### 5. **analyze-project-structure.js**
   - **Purpose**: Analysis script that generated all the above files
   - **Contents**: Node.js script that scans and analyzes the codebase
   - **Best for**: Regenerating documentation when files change

## 📊 Project Statistics

- **Total Files**: 927
  - Frontend: 499 files
  - Backend: 428 files
- **Files with Dependencies**: 619
- **Total Dependencies**: 2,374

### Frontend Breakdown
- **Pages**: 296 files
- **Components**: 139 files
- **Services**: 20 files
- **Utils**: 14 files
- **Layouts**: 5 files
- **Providers**: 6 files
- **Hooks**: 8 files
- **Config**: 2 files

### Backend Breakdown
- **Routes**: 74 files
- **Services**: 102 files
- **Models**: 73 files
- **Middleware**: 21 files
- **Utils**: 5 files
- **Config**: 7 files
- **Modules**: 85 files

## 🗺️ Quick Navigation Guide

### Finding Files by Folder Structure
1. **Start with PROJECT_FOLDER_STRUCTURE_DIAGRAM.md** - Shows actual folder paths
2. Navigate using the folder tree structure
3. Find files like:
   - Supra Admin: `features/admin/pages/SupraAdmin/`
   - Tenant Pages: `features/tenant/pages/tenant/org/`
   - Backend Routes: `backend/src/routes/` or `backend/src/modules/{module}/routes/`

### Understanding the Architecture
1. Start with **PROJECT_ARCHITECTURE_FLOW_DIAGRAM.md** for high-level overview
2. Review the "High-Level Architecture Overview" section
3. Explore "Frontend-Backend Integration Flow" to understand communication
4. Check "Data Flow Examples" for specific workflows

### Finding Files by Category
1. Use **PROJECT_STRUCTURE_INDEX.md** to browse by category
2. Search for specific file names or paths
3. Check the "Key Dependencies" section to understand relationships

### Understanding Dependencies
1. View **PROJECT_STRUCTURE_DIAGRAM.md** for visual dependency graph
2. Check **PROJECT_STRUCTURE_INDEX.json** for programmatic access
3. Review dependency counts in the index files

### Exploring Modules
1. See "Module Organization" in **PROJECT_ARCHITECTURE_FLOW_DIAGRAM.md**
2. Check how modules relate to shared/common code
3. Understand module boundaries and responsibilities

## 🔄 Regenerating Documentation

To regenerate all documentation files after making changes to the codebase:

```bash
cd c:\Users\Super\Desktop\TWS
node analyze-project-structure.js
```

This will:
- Scan all frontend and backend files
- Extract import/require dependencies
- Generate updated diagrams and indexes
- Create all documentation files

## 📖 How to Read the Diagrams

### Mermaid Diagrams
The diagrams use Mermaid syntax and can be viewed in:
- **GitHub/GitLab**: Automatically rendered
- **VS Code**: Install "Markdown Preview Mermaid Support"
- **Online**: [Mermaid Live Editor](https://mermaid.live)
- **Documentation Tools**: Most support Mermaid

### Diagram Types
- **Graph TB** (Top to Bottom): Hierarchical structures
- **Graph LR** (Left to Right): Flow sequences
- **Sequence Diagram**: Time-based interactions
- **Subgraphs**: Grouped related components

## 🎯 Common Use Cases

### 1. Onboarding New Developers
- Read **PROJECT_ARCHITECTURE_FLOW_DIAGRAM.md** first
- Review "High-Level Architecture Overview"
- Explore module organization
- Check data flow examples

### 2. Finding Related Files
- Use **PROJECT_STRUCTURE_INDEX.md** to find files by category
- Check dependencies in the JSON file
- Follow relationships in the diagram

### 3. Understanding a Feature
- Locate feature files in the index
- Check dependencies in the diagram
- Review data flow examples
- Trace through module organization

### 4. Refactoring
- Review dependency graph to understand impact
- Check file relationships before moving code
- Use JSON file for programmatic analysis

### 5. Debugging
- Trace data flow through diagrams
- Check service dependencies
- Review integration points
- Understand module boundaries

## 📝 File Categories Explained

### Frontend Categories
- **Pages**: Main page components (routes)
- **Components**: Reusable UI components
- **Services**: API service layers
- **Utils**: Utility functions and helpers
- **Layouts**: Layout wrapper components
- **Providers**: React context providers
- **Hooks**: Custom React hooks
- **Config**: Configuration files

### Backend Categories
- **Routes**: Express route definitions
- **Controllers**: Request handlers (if separate)
- **Models**: Mongoose database models
- **Services**: Business logic services
- **Middleware**: Express middleware functions
- **Utils**: Utility functions
- **Config**: Configuration files
- **Modules**: Feature modules (routes + services)

## 🔗 Key Relationships

### Frontend → Backend
- API Services → Express Routes
- Components → API Services → Backend Routes
- Auth Context → Authentication Routes
- Socket Context → WebSocket Server

### Backend Internal
- Routes → Middleware → Controllers → Services → Models
- Services → Other Services
- Services → Utils
- Models → Database

### Shared Patterns
- Services layer abstracts API calls
- Utils provide common functionality
- Middleware handles cross-cutting concerns
- Models define data structures

## 🚀 Next Steps

1. **Explore the Architecture**: Start with PROJECT_ARCHITECTURE_FLOW_DIAGRAM.md
2. **Find Specific Files**: Use PROJECT_STRUCTURE_INDEX.md
3. **Understand Dependencies**: Check PROJECT_STRUCTURE_DIAGRAM.md
4. **Programmatic Access**: Use PROJECT_STRUCTURE_INDEX.json

## 📚 Additional Resources

- Project root README files
- Architecture documentation in `docs/` directory
- API documentation (Swagger)
- Development guides

## 🔧 Maintenance

The analysis script should be run:
- After major refactoring
- When adding new major features
- Before important releases
- When onboarding new team members

---

**Generated**: Automatically by `analyze-project-structure.js`  
**Last Updated**: Check file timestamps  
**Format**: Markdown, JSON, Mermaid diagrams
