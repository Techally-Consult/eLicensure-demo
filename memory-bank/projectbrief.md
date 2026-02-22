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

- **Screens:** Global layout (AppLayout/AppShell), Dashboard (`/`), Application List (`/applications`), Application Detail (`/applications/$id`), New Application Wizard (`/apply`), Edit Application Wizard (`/apply/$id`).
- **Wizard:** Single multi-step flow for all three license types (Steps 0–7: license type → applicant → facility → services & capacity → staffing → infrastructure → type-specific → review & submit). Supports both create (`/apply`) and edit (`/apply/$id`); edit loads application into wizard state and saves via `updateApplication`.
- **Data:** Mock applications (12 seed, full-form) and mock facilities; async mock API layer (`listApplications`, `getApplication`, `submitApplication`, `updateApplication`, `updateApplicationStatus`); TanStack Query hooks; wizard state kept local in wizard page; detail supports status change (updates store + timeline).
- **UI:** shadcn form patterns, Tailwind layout/spacing, status pills, summary cards, tables, timeline, stepper.

## Out of Scope (Prototype)

- Real backend or persistence.
- Real file upload (floor plan is placeholder).
- Authentication beyond a placeholder avatar.
