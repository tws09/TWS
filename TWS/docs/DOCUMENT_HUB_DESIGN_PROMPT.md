# Document Hub – Design Brief (ERP)

**Use this prompt with a senior product/UI designer or an AI design agent.**  
It reflects your requirements: org-wide use, cloud-only, approval workflow, created + uploaded docs, folders + tags, single-tenant, employee doc freedom, version/audit/retention, and a world-class mixed visual style.

---

## Prompt (copy-paste ready)

Act as a senior product designer billed at $200/hour, specializing in enterprise document systems and ERP UX.

### Context

You are redesigning the **Document Hub** inside a **Software House ERP** used by organizations (single tenant per org). The hub currently has: a document list (search, create from templates, open/delete), a BlockNote-based editor with Save and Export (HTML/Word/PDF), and 7 business templates (Proposal, Contract, Meeting notes, Project brief, SOW, Invoice cover, Blank). Today data is in the browser only; the product is moving to **fully cloud-based storage**—no localStorage. There is no backend persistence, folders, versioning, sharing, approval, or mixed file library yet.

### Your mission

1. **Analyze** the existing Document Hub (list, editor, templates, storage, placement under tenant org) and document current state and gaps.
2. **Reshape** it into a full Document Hub that feels like a first-class ERP module: professional, scalable, and loved by every org user for both UI and UX.

### Design constraints (fixed)

- **Users:** Everyone in the org can use the Document Hub (no role restriction for access).
- **Scope:** Standalone hub (no mandatory links to Projects/Clients/Finance in v1).
- **Storage:** Fully cloud-based; no localStorage. Assume backend API + cloud storage (e.g. S3) for all documents and uploads.
- **Tenancy:** Single tenant / org level only (no cross-tenant or group-level docs).
- **Employee portal:** HR/employee documents (e.g. onboarding docs per employee) stay **separate**. Employees get the freedom to **create new docs** and **manage their own folders** within their space—design so both “org Document Hub” and “employee doc area” feel consistent but clearly scoped (org vs my docs).

### Required features (ERP-style Document Hub)

- **Unified library**
  - **Created documents** (from templates or blank) and **uploaded files** (PDF, Word, etc.) in **one** library.
  - Search, filters (type, status, date, owner, folder, tags), sort, list/grid/table views, and bulk actions where appropriate.

- **Folders and tags**
  - **Folders** (hierarchy) and **tags/labels** so users can organize and find documents quickly. Consider “document type” (e.g. Proposal, Contract) as a first-class filter.

- **Document lifecycle and approval**
  - Clear states: e.g. **Draft → In review → Approved → Archived**.
  - **Approval workflow**: request review, approve/reject, optional comments. Design so approvers see a clear queue and document status.

- **Templates**
  - Keep and extend templates (proposals, contracts, meeting notes, SOW, invoice cover, etc.). Support org-level templates; optional admin-managed templates later.

- **Creation and editing**
  - Create from template or blank; rich editor (title, body, save). Export to HTML/Word/PDF. Design for **autosave** and **version history** (see below).

- **Version history and audit**
  - **Version history**: previous versions of a document visible and restorable where applicable.
  - **Audit trail**: who viewed/edited when (and optionally approval events). Design for compliance and “who did what” clarity.
  - **Retention**: consider retention policies in the design (e.g. how long versions are kept, soft delete vs purge). No need to implement logic—just ensure UI/UX and data model can support it.

- **Permissions and sharing**
  - Who can see/edit what at org level (e.g. by role or permission). Optional: share specific doc or folder with certain users with view/edit. Design so sharing and approval feel integrated.

- **UX principles**
  - Information density without clutter; consistent with the rest of the ERP.
  - Keyboard-friendly and accessible (WCAG).
  - Clear empty, loading, and error states; responsive, desktop-first.

### Visual and creative direction

- **Style:** Do not copy one product. Combine the **best patterns and aesthetics** from world-class document and productivity tools (e.g. Notion, Confluence, Google Drive, Linear, Figma, enterprise ERPs) into a **new, creative presentation** that feels fresh, professional, and “best in class.”
- Aim for a look and interaction model that orgs would describe as **premium**, **trustworthy**, and **delightful** to use every day.

### Deliverables

- Short **current-state and gap analysis** (what exists, what’s missing).
- **Information architecture**: sitemap and key user flows for the Document Hub (org-level) and how it relates to “employee own docs” (separate but consistent).
- **Key screens**: Hub home (list/table + filters, folders, tags), template picker, editor (toolbar, export, autosave indicator), folder/tag management, approval queue/review view, version history view, and audit/activity view (or placeholders).
- **Component and pattern notes**: tables, filters, cards, modals, status badges, approval controls—aligned with the existing ERP UI.
- Optional: low-fidelity wireframes or key UI copy for critical states (empty, loading, error, success, “in review,” “approved”).

Design so that an organization using this ERP would choose this Document Hub over ad-hoc drives and scattered files—clear, trustworthy, and a pleasure to use daily.

---

## Quick reference: your choices

| Topic              | Choice                                                                 |
|--------------------|------------------------------------------------------------------------|
| Users              | Everyone in the org                                                    |
| Integration        | Standalone (no mandatory Project/Client/Invoice links in v1)          |
| Storage            | Fully cloud-based; no localStorage                                     |
| Approval           | Yes – draft → in review → approved (and archived)                     |
| Library            | Both created documents and uploaded files in one hub                  |
| Structure          | Folders + tags (and document type as filter)                          |
| Tenancy            | Single tenant / org only                                               |
| Employee portal    | Separate; employees can create docs and manage their own folders       |
| Version / audit    | Version history, audit trail, retention considered in design           |
| Visual style       | Best-in-world mix; new creative presentation                          |

---

*Generated from your requirements. Update this file as scope or constraints change.*
