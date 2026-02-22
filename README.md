# eLicensure — Facility License Demo App

A static web prototype for end-to-end facility licensing. It demonstrates screen structure, navigation, and form UX for **New**, **Renewal**, and **Additional service** license flows using mock data and role-based views.

## Features

- **Mock auth** — Log in by selecting a role (Applicant, Inspector, Team Leader, Admin).
- **Role-based UI** — Dashboard, application list, and apply flows vary by role (e.g. applicants see only their applications; inspectors see assigned inspections).
- **Application wizard** — Multi-step form for new applications; for Renewal/Variation/Additional service, start by selecting an existing application, then follow the type-specific flow (renewal request, full edit, or partial edit for additional service).
- **Workflow** — Draft → Submitted → Assigned → Under Inspection → Inspection Submitted/Rejected → Approved or Rejected; team leader assigns inspectors and reviews inspections.
- **In-app notifications** — Bell in header with notifications on status change, assign, inspection submit, approve/return.

## Tech Stack

- **React** 19, **TypeScript**
- **Vite** 7 — build and dev server
- **TanStack Router** — routing and layouts
- **TanStack Query** — data fetching (mock API)
- **Tailwind CSS** 4, **shadcn/ui** (Radix) — styling and components
- **Recharts** — dashboard charts

## Getting Started

### Install

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

App runs at `http://localhost:5173`. Use the login page to pick a role (no password).

### Build & typecheck

```bash
pnpm run build
pnpm run typecheck
```

Preview production build:

```bash
pnpm run preview
```

## Project Structure

- `app/` — routes, pages, layouts, components, hooks, data (mock API, auth, notifications), types
- `docs/` — [Application features and flows](docs/application-features-and-flows.md), PRD, and plans
- `memory-bank/` — project context and progress notes for AI/development

## Documentation

- **[Application features and flows](docs/application-features-and-flows.md)** — Roles, routes, wizard flows (New, Renewal, Variation, Additional service), and status workflow
- **docs/eLicensure-Core-PRD.md** — Product requirements
- **docs/plan-renewal-variation-additional-flows.md** — Plan for list → select and type-specific apply flows

## Mock Data

All data is in-memory (no backend). Four users (Applicant, Inspector, Team Leader, Admin), 12 seed applications, and a small facility list. Session storage holds the current user; reload clears in-memory mutations but keeps the logged-in role.
