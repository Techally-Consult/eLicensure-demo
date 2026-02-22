# Project Brief: eLicensure Static Web App

## Project Name
eLicensure (facility licensing demo) – static web app prototype.

## Core Requirements & Goals

- **Show end-to-end facility licensing flows** using static/mock data:
  - **New** facility license
  - **Renewal** of existing license
  - **Additional service** license
- **Demonstrate** screen structure, navigation, and basic form UX.
- **Use** (per PRD): TanStack Router for routes/layouts, TanStack Query for mock data fetching, shadcn + Tailwind for UI components.

## Scope (Source of Truth)

- **Screens:** Login (`/login`); global layout (AppLayout) with role-based nav; Dashboard (`/`); Application List (`/applications`), Application Detail (`/applications/$id`); New/Edit Application Wizard (`/apply`, `/apply/$id`); Team Leader (`/team-leader` — assign inspector, review inspection); Inspection list/detail (`/inspection`, `/inspection/$id` — inspector); Users (`/users` — Admin only).
- **Auth (mock):** Four roles (Admin, Applicant, Team Leader, Inspector); mock login by role selection; current user in AuthContext + sessionStorage; unauthenticated users redirected to `/login`.
- **Wizard:** Single multi-step flow for all three license types; supports create and edit; search param `type=renewal|variation|additional` pre-selects license type.
- **Workflow:** Applicant: Draft → Submitted. Team leader: assign to inspector → Assigned → Under Inspection. Inspector: submit inspection → Inspection Submitted or Inspection Rejected. Team leader: approve license or return to applicant with remark. Statuses: Draft, Submitted, Assigned, Under Inspection, Inspection Submitted, Inspection Rejected, Under Review, Approved, Rejected.
- **Data:** Mock applications (12 seed, full-form, each with applicantUserId; 2–3 with assignedTo for Inspector demo), facilities, mock users; API includes listApplications(options?: { role, userId }) for role-filtered list, assignApplication, submitInspection, approveLicense, returnToApplicant; Application has applicantUserId, assignedTo, inspection, remark.
- **UI:** shadcn form patterns, Tailwind layout/spacing, status pills, summary cards, tables, timeline, role-based sidebar; application list and dashboard content vary by role (Applicant: my applications; Inspector: assigned to me; Team Leader/Admin: all).

## Out of Scope (Prototype)

- Real backend or persistence.
- Real file upload (floor plan is placeholder).
- Real authentication (mock: role selection only).
- In-app notifications: implemented (mock store, bell + dropdown); optional next: seed notifications per role so each user sees demo notifications on login.
