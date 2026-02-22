# TWS Multi-Tenant ERP Platform - Use Case Diagrams

## PlantUML Use Case Diagrams

This directory contains PlantUML Use Case Diagrams for the TWS Multi-Tenant ERP Platform in UML character style (not flowchart style).

## Available Diagrams

### 1. `TWS_USE_CASE_DIAGRAM.puml`
**Complete detailed diagram** with all actors, use cases, and relationships. Includes full descriptions and all industry-specific actors.

**Best for:** Complete documentation, comprehensive view

### 2. `TWS_USE_CASE_DIAGRAM_MAIN.puml`
**Main diagram** with organized structure, notes, and clear grouping. Most similar to traditional UML Use Case Diagrams.

**Best for:** SRS documentation, formal presentations

### 3. `TWS_USE_CASE_DIAGRAM_A4.puml`
**A4 landscape optimized** version with compact layout, grouped use cases in packages, and optimized for printing.

**Best for:** Printing on A4 paper, reports

### 4. `TWS_USE_CASE_DIAGRAM_FINAL.puml`
**Final clean version** with simplified labels, compact layout, and all essential relationships. Best balance between detail and readability.

**Best for:** General use, quick reference

## How to View/Export PlantUML Diagrams

### Option 1: Online PlantUML Server
1. Go to http://www.plantuml.com/plantuml
2. Copy the contents of any `.puml` file
3. Paste into the editor
4. View the diagram
5. Export as PNG, SVG, or PDF

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` (Windows) or `Option+D` (Mac) to preview
4. Right-click to export as image

### Option 3: Desktop Application
1. Download PlantUML from http://plantuml.com/download
2. Install Java (required)
3. Open `.puml` file in PlantUML
4. Export as needed

### Option 4: Command Line
```bash
# Install PlantUML (requires Java)
# Then run:
java -jar plantuml.jar TWS_USE_CASE_DIAGRAM_FINAL.puml

# This generates PNG by default
# For PDF:
java -jar plantuml.jar -tpng TWS_USE_CASE_DIAGRAM_FINAL.puml
```

## Diagram Structure

### Actors (Left & Right Sides)
- **Left Side**: Platform & Tenant Actors
  - Supra Admin
  - Tenant Admin
  - Manager
  - Employee

- **Right Side**: Industry-Specific Actors
  - Education: Principal, Teacher, Student
  - Healthcare: Doctor, Patient
  - Software House: Project Manager, Developer
  - Pre-Tenant User

### Use Cases (Center - System Boundary)

**Authentication & Access:**
- UC-01: User Login / Authentication
- UC-02: Self-Serve Tenant Signup & Provisioning
- UC-15: Password Recovery

**Administration:**
- UC-03: Tenant Management
- UC-04: User Management
- UC-05: Role & Permission Management
- UC-06: Master ERP Template Management
- UC-13: Subscription & Billing Management
- UC-16: User Activity History

**Industry Modules:**
- UC-07: Education ERP Module Management
- UC-08: Healthcare ERP Module Management
- UC-09: Software House ERP Module Management

**Common Features:**
- UC-10: Dashboard & Analytics
- UC-11: Report Generation & Export
- UC-12: Messaging & Notifications
- UC-14: User Profile Management

## Use Case Relationships

### Include Relationships (<<include>>)
- **UC-01 includes UC-10**: Login always leads to Dashboard
- **UC-02 includes UC-06**: Tenant signup applies Master ERP Template
- **UC-04 includes UC-05**: User Management requires Role Management
- **UC-14 includes UC-16**: Profile Management tracks Activity History

### Extend Relationships (<<extend>>)
- **UC-15 extends UC-01**: Password Recovery extends Login (when password forgotten)
- **UC-11 extends UC-07, UC-08, UC-09**: Reports extend Industry Modules (optional)
- **UC-04 extends UC-02**: User Management extends Tenant Signup (after creation)

## Printing Instructions

1. **For A4 Landscape Printing:**
   - Use `TWS_USE_CASE_DIAGRAM_A4.puml` or `TWS_USE_CASE_DIAGRAM_FINAL.puml`
   - Export as PNG or PDF
   - Set page orientation to Landscape
   - Scale to fit page width

2. **Export Settings:**
   - Format: PNG (for documents) or PDF (for printing)
   - Resolution: 300 DPI for high quality
   - Background: White (already set in diagram)

3. **Recommended File:**
   - **For SRS Document**: Use `TWS_USE_CASE_DIAGRAM_MAIN.puml`
   - **For Printing**: Use `TWS_USE_CASE_DIAGRAM_FINAL.puml`
   - **For Complete View**: Use `TWS_USE_CASE_DIAGRAM.puml`

## Customization

To customize the diagrams, edit the `.puml` files:

- **Change colors**: Modify `skinparam usecase BackgroundColor` and `skinparam actor BackgroundColor`
- **Change font size**: Modify `FontSize` in skinparam sections
- **Add/remove relationships**: Add or remove `-->` lines
- **Add notes**: Use `note right of UC01` syntax

## Integration with SRS Document

The main diagram (`TWS_USE_CASE_DIAGRAM_MAIN.puml`) is referenced in the SRS document at section 5.2. To update:

1. Export the PlantUML diagram as PNG/PDF
2. Insert the image in the SRS document at section 5.2
3. Or keep the PlantUML file reference for dynamic rendering

