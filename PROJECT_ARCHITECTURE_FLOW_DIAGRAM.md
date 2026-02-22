# TWS Project Architecture Flow Diagram

This document provides a comprehensive visual representation of the TWS (The Wolf Stack) project structure, showing how frontend and backend files are organized and how they relate to each other.

## High-Level Architecture Overview

```mermaid
graph TB
    subgraph Client["Client Browser"]
        UI[React Frontend<br/>Port 3000]
    end
    
    subgraph Backend["Backend Server"]
        API[Express API Server<br/>Port 4000/5000]
        WS[WebSocket/Socket.io<br/>Real-time Communication]
        DB[(MongoDB<br/>Database)]
        Redis[(Redis<br/>Cache/Optional)]
    end
    
    UI -->|HTTP/REST API| API
    UI -->|WebSocket| WS
    API --> DB
    API --> Redis
    WS --> DB
    
    style Client fill:#e1f5ff
    style Backend fill:#fff4e1
    style DB fill:#ffe1f5
    style Redis fill:#f5ffe1
```

## Detailed Frontend Structure

```mermaid
graph TB
    subgraph Frontend["Frontend Application (React)"]
        direction TB
        
        Entry[App.js<br/>Main Entry Point]
        
        subgraph Routing["Routing Layer"]
            Router[React Router<br/>Route Configuration]
        end
        
        subgraph Providers["Context Providers"]
            AuthCtx[AuthContext<br/>Authentication State]
            SocketCtx[SocketContext<br/>WebSocket Connection]
            ThemeCtx[ThemeContext<br/>Theme Management]
            TenantCtx[TenantContext<br/>Tenant State]
        end
        
        subgraph Layouts["Layout Components"]
            UnifiedLayout[UnifiedLayout<br/>Main Layout Wrapper]
            SupraAdminLayout[SupraAdminLayout<br/>Admin Layout]
            TenantLayout[TenantOrgLayout<br/>Tenant Layout]
        end
        
        subgraph Pages["Page Components"]
            direction LR
            SupraAdminPages[Supra Admin Pages<br/>- Dashboard<br/>- Analytics<br/>- Tenant Management<br/>- ERP Management]
            TenantPages[Tenant Pages<br/>- Dashboard<br/>- Projects<br/>- Finance<br/>- HR<br/>- Software House]
            AuthPages[Auth Pages<br/>- Login<br/>- Signup<br/>- Tenant Login]
            EmployeePages[Employee Pages<br/>- Portal<br/>- Attendance<br/>- Payroll]
        end
        
        subgraph Services["API Services"]
            direction LR
            ApiClient[apiClient<br/>Base HTTP Client]
            AxiosInstance[axiosInstance<br/>Axios Configuration]
            TenantApi[tenantApiService<br/>Tenant APIs]
            IndustryApi[industry APIs<br/>- educationApi<br/>- healthcareApi<br/>- softwareHouseApi]
            ProjectApi[projectApiService<br/>Project APIs]
        end
        
        subgraph Components["Reusable Components"]
            direction LR
            UIComponents[UI Components<br/>- Buttons<br/>- Cards<br/>- Forms<br/>- Modals]
            Navigation[Navigation<br/>- Sidebar<br/>- Header<br/>- Mobile Menu]
            Feedback[Feedback<br/>- Loading<br/>- Errors<br/>- Alerts]
        end
        
        subgraph Utils["Utilities"]
            direction LR
            ErrorHandler[errorHandler<br/>Error Management]
            Logger[logger<br/>Logging]
            AuthUtils[auth.js<br/>Auth Helpers]
            Validators[validation<br/>Form Validation]
        end
        
        Entry --> Router
        Router --> Providers
        Providers --> Layouts
        Layouts --> Pages
        Pages --> Services
        Pages --> Components
        Services --> ApiClient
        Services --> AxiosInstance
        Components --> Utils
        Pages --> Utils
    end
    
    style Frontend fill:#e1f5ff
    style Entry fill:#b3e5fc
    style Providers fill:#c8e6c9
    style Pages fill:#fff9c4
    style Services fill:#f8bbd0
```

## Detailed Backend Structure

```mermaid
graph TB
    subgraph Backend["Backend Server (Express.js)"]
        direction TB
        
        Entry[app.js / server.js<br/>Main Entry Point]
        
        subgraph Middleware["Middleware Layer"]
            AuthMW[auth.js<br/>Authentication]
            RBAC[rbac.js<br/>Role-Based Access]
            ModuleAccess[moduleAccessControl.js<br/>Module Permissions]
            RateLimit[rateLimiter.js<br/>Rate Limiting]
            ErrorMW[errorHandler.js<br/>Error Handling]
            Validation[inputValidation.js<br/>Input Validation]
        end
        
        subgraph Routes["Route Handlers"]
            direction LR
            AuthRoutes[Authentication Routes<br/>/api/auth/*]
            SupraAdminRoutes[Supra Admin Routes<br/>/api/supra-admin/*]
            TenantRoutes[Tenant Routes<br/>/api/tenant/*]
            ProjectRoutes[Project Routes<br/>/api/projects/*]
            FinanceRoutes[Finance Routes<br/>/api/finance/*]
            HRRoutes[HR Routes<br/>/api/hr/*]
            AttendanceRoutes[Attendance Routes<br/>/api/attendance/*]
            MessagingRoutes[Messaging Routes<br/>/api/messaging/*]
        end
        
        subgraph Controllers["Controllers"]
            direction LR
            TenantController[Tenant Controller<br/>Business Logic]
        end
        
        subgraph Services["Business Logic Services"]
            direction LR
            TenantService[tenantService<br/>Tenant Management]
            TenantProvisioning[tenantProvisioningService<br/>Tenant Setup]
            DatabaseProvisioning[databaseProvisioningService<br/>DB Management]
            MasterERPService[masterERPService<br/>ERP Templates]
            EmailService[emailService<br/>Email Sending]
            AuthService[Authentication Services]
            FinanceService[Finance Services]
            HRService[HR Services]
        end
        
        subgraph Models["Data Models (Mongoose)"]
            direction LR
            UserModel[User Model]
            TenantModel[Tenant Model]
            ProjectModel[Project Model]
            FinanceModels[Finance Models<br/>- Transaction<br/>- Account<br/>- Invoice]
            HRModels[HR Models<br/>- Employee<br/>- Payroll<br/>- Attendance]
            ERPTemplate[ERPTemplate Model]
            SubscriptionPlan[SubscriptionPlan Model]
        end
        
        subgraph Config["Configuration"]
            direction LR
            EnvConfig[environment.js<br/>Environment Config]
            FirebaseConfig[firebase-admin.js<br/>Firebase Setup]
            RedisConfig[redis.js<br/>Redis Setup]
            LoggingConfig[logging.js<br/>Logging Setup]
        end
        
        subgraph Workers["Background Workers"]
            direction LR
            NotificationWorker[notificationWorker<br/>Notifications]
            FileProcessor[fileProcessor<br/>File Processing]
            RetentionWorker[retentionWorker<br/>Data Retention]
        end
        
        Entry --> Middleware
        Middleware --> Routes
        Routes --> Controllers
        Controllers --> Services
        Services --> Models
        Services --> Config
        Services --> Workers
        Models --> DB[(MongoDB)]
        Workers --> DB
    end
    
    style Backend fill:#fff4e1
    style Entry fill:#ffe0b2
    style Routes fill:#fff9c4
    style Services fill:#f8bbd0
    style Models fill:#c8e6c9
    style DB fill:#ffe1f5
```

## Frontend-Backend Integration Flow

```mermaid
graph LR
    subgraph Frontend["Frontend (Port 3000)"]
        F1[React Component]
        F2[API Service Layer]
        F3[Axios Instance]
    end
    
    subgraph Network["Network Layer"]
        HTTP[HTTP/REST API]
        WS[WebSocket]
    end
    
    subgraph Backend["Backend (Port 4000)"]
        B1[Express Routes]
        B2[Middleware]
        B3[Controllers]
        B4[Services]
        B5[Models]
    end
    
    subgraph Database["Database"]
        MongoDB[(MongoDB)]
    end
    
    F1 --> F2
    F2 --> F3
    F3 -->|HTTP Requests| HTTP
    F3 -->|WebSocket| WS
    HTTP --> B1
    WS --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> MongoDB
    
    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style Database fill:#ffe1f5
```

## Module Organization

### Frontend Modules

```mermaid
graph TB
    subgraph FrontendModules["Frontend Feature Modules"]
        Admin[Admin Module<br/>- Supra Admin Pages<br/>- Admin Components<br/>- Admin Services]
        Tenant[Tenant Module<br/>- Tenant Pages<br/>- Tenant Components<br/>- Tenant Services]
        Projects[Projects Module<br/>- Project Pages<br/>- Project Components<br/>- Project Services]
        Finance[Finance Module<br/>- Finance Pages<br/>- Finance Components<br/>- Finance Services]
        HR[HR Module<br/>- HR Pages<br/>- HR Components<br/>- HR Services]
        Auth[Auth Module<br/>- Login Pages<br/>- Auth Components<br/>- Auth Services]
        Employees[Employees Module<br/>- Employee Pages<br/>- Employee Components]
        Dashboard[Dashboard Module<br/>- Dashboard Pages<br/>- Analytics Components]
    end
    
    Shared[Shared Module<br/>- Common Components<br/>- Utilities<br/>- Hooks<br/>- Services]
    
    Admin --> Shared
    Tenant --> Shared
    Projects --> Shared
    Finance --> Shared
    HR --> Shared
    Auth --> Shared
    Employees --> Shared
    Dashboard --> Shared
    
    style Shared fill:#c8e6c9
```

### Backend Modules

```mermaid
graph TB
    subgraph BackendModules["Backend Feature Modules"]
        AuthModule[Auth Module<br/>- Authentication Routes<br/>- Auth Services<br/>- Auth Models]
        AdminModule[Admin Module<br/>- Supra Admin Routes<br/>- Admin Services]
        TenantModule[Tenant Module<br/>- Tenant Routes<br/>- Tenant Services<br/>- Tenant Models]
        BusinessModule[Business Module<br/>- Master ERP Routes<br/>- ERP Services<br/>- ERP Models]
        ProjectsModule[Projects Module<br/>- Project Routes<br/>- Project Services<br/>- Project Models]
    end
    
    Common[Common Module<br/>- Middleware<br/>- Utils<br/>- Config<br/>- Models]
    
    AuthModule --> Common
    AdminModule --> Common
    TenantModule --> Common
    BusinessModule --> Common
    ProjectsModule --> Common
    
    style Common fill:#c8e6c9
```

## Data Flow Examples

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    
    U->>F: Enter Credentials
    F->>B: POST /api/auth/login
    B->>B: Validate Input
    B->>B: Hash Password
    B->>DB: Query User
    DB-->>B: User Data
    B->>B: Verify Password
    B->>B: Generate JWT Token
    B-->>F: Return Token + User Data
    F->>F: Store in AuthContext
    F-->>U: Redirect to Dashboard
```

### Tenant Creation Flow

```mermaid
sequenceDiagram
    participant A as Supra Admin
    participant F as Frontend
    participant B as Backend
    participant TPS as Tenant Provisioning Service
    participant DPS as Database Provisioning Service
    participant DB as MongoDB
    
    A->>F: Create Tenant Form
    F->>B: POST /api/supra-admin/tenants
    B->>TPS: Create Tenant
    TPS->>DPS: Provision Database
    DPS->>DB: Create Database
    DB-->>DPS: Database Created
    DPS-->>TPS: Database Ready
    TPS->>DB: Seed Initial Data
    TPS->>DB: Create Admin User
    TPS-->>B: Tenant Created
    B-->>F: Success Response
    F-->>A: Show Success Message
```

## File Relationship Summary

### Key Frontend Files and Their Dependencies

1. **App.js** (Entry Point)
   - Imports: AuthContext, SocketContext, ThemeContext
   - Imports: All route components
   - Imports: UnifiedLayout

2. **AuthContext.js**
   - Uses: axiosInstance
   - Uses: apiClient
   - Uses: errorHandler

3. **API Services**
   - All services use: axiosInstance
   - All services use: errorHandler
   - Industry APIs use: apiClientFactory

4. **Pages**
   - Use: Layout components
   - Use: API services
   - Use: Shared components
   - Use: Utils

### Key Backend Files and Their Dependencies

1. **app.js** (Entry Point)
   - Imports: All middleware
   - Imports: All routes
   - Imports: Config files
   - Sets up: Express app, Socket.io, MongoDB

2. **Routes**
   - Use: Middleware (auth, rbac, validation)
   - Use: Controllers
   - Use: Services

3. **Services**
   - Use: Models
   - Use: Other services
   - Use: Utils

4. **Models**
   - Use: Mongoose
   - Define: Database schemas

## Statistics

- **Total Files**: 927
  - Frontend: 499 files
  - Backend: 428 files
- **Files with Dependencies**: 619
- **Total Dependencies**: 2,374
- **Frontend Categories**:
  - Pages: 296 files
  - Components: 139 files
  - Services: 20 files
  - Utils: 14 files
  - Layouts: 5 files
  - Providers: 6 files
  - Hooks: 8 files
  - Config: 2 files
- **Backend Categories**:
  - Routes: 74 files
  - Services: 102 files
  - Models: 73 files
  - Middleware: 21 files
  - Utils: 5 files
  - Config: 7 files
  - Modules: 85 files

## How to Use These Diagrams

1. **High-Level Architecture**: Understand the overall system structure
2. **Frontend Structure**: Navigate frontend code organization
3. **Backend Structure**: Navigate backend code organization
4. **Integration Flow**: Understand how frontend and backend communicate
5. **Module Organization**: Find related files within modules
6. **Data Flow Examples**: Understand specific workflows

## Viewing the Diagrams

These Mermaid diagrams can be viewed in:
- **GitHub/GitLab**: Automatically rendered in markdown files
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **Online**: Copy code to [Mermaid Live Editor](https://mermaid.live)
- **Documentation Tools**: Most modern documentation platforms support Mermaid

## Actual Folder Structure

### Frontend Folder Organization

```mermaid
graph TB
    subgraph FrontendFolders["frontend/src/"]
        App[App.js]
        
        subgraph Features["features/"]
            Admin[admin/<br/>├── pages/<br/>│   └── SupraAdmin/<br/>│       ├── Users.js<br/>│       ├── Dashboard.js<br/>│       ├── Analytics.js<br/>│       └── messaging/<br/>└── components/]
            Tenant[tenant/<br/>├── pages/<br/>│   └── tenant/org/<br/>│       ├── finance/<br/>│       ├── projects/<br/>│       ├── software-house/<br/>│       └── education/<br/>└── components/]
            Projects[projects/<br/>├── pages/<br/>├── components/<br/>├── services/<br/>└── utils/]
            Finance[finance/<br/>├── pages/<br/>└── components/]
            HR[hr/<br/>├── pages/hr/<br/>└── components/]
            Employees[employees/<br/>├── pages/<br/>└── components/Attendance/]
            Auth[auth/<br/>├── pages/<br/>└── components/]
        end
        
        Shared[shared/<br/>├── components/<br/>├── services/<br/>├── utils/<br/>└── hooks/]
        
        App --> Features
        App --> Shared
    end
    
    style Features fill:#fff9c4
    style Shared fill:#c8e6c9
```

### Backend Folder Organization

```mermaid
graph TB
    subgraph BackendFolders["backend/src/"]
        Entry[app.js]
        
        subgraph Routes["routes/"]
            RouteFiles[74 route files<br/>- auth.js<br/>- supraAdmin.js<br/>- tenantManagement.js<br/>- projects.js<br/>- finance.js<br/>- etc.]
        end
        
        subgraph Modules["modules/"]
            AdminMod[admin/routes/<br/>- twsAdmin.js<br/>- supraAdmin.js<br/>- supraTenantERP.js]
            AuthMod[auth/routes/<br/>- authentication.js<br/>- tenantAuth.js]
            BusinessMod[business/routes/<br/>- masterERP.js<br/>- projects.js<br/>- finance.js]
            TenantMod[tenant/routes/<br/>- organization.js<br/>- projects.js<br/>- education.js]
        end
        
        Services[services/<br/>102 service files]
        Models[models/<br/>73 model files]
        
        Entry --> Routes
        Entry --> Modules
        Routes --> Services
        Routes --> Models
        Modules --> Services
        Modules --> Models
    end
    
    style Routes fill:#fff9c4
    style Modules fill:#f8bbd0
    style Services fill:#c8e6c9
```

### Key Folder Paths

**Frontend:**
- Supra Admin Pages: `features/admin/pages/SupraAdmin/`
- Tenant Org Pages: `features/tenant/pages/tenant/org/`
- Shared Services: `shared/services/`
- API Client: `shared/utils/axiosInstance.js`

**Backend:**
- Main Routes: `routes/` (74 files)
- Module Routes: `modules/{module}/routes/`
- Services: `services/` (102 files)
- Models: `models/` (73 files)

## Related Files

- `PROJECT_FOLDER_STRUCTURE_DIAGRAM.md` - **⭐ Complete folder hierarchy with actual paths**
- `PROJECT_STRUCTURE_INDEX.md` - Detailed file listing
- `PROJECT_STRUCTURE_INDEX.json` - Machine-readable index
- `PROJECT_STRUCTURE_DIAGRAM.md` - Detailed dependency graph
