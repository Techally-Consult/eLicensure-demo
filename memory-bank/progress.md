# Progress

## What Works

- Repo scaffold: React Router 7, React 19, Tailwind 4, Vite 7, TypeScript.
- Single index route → `routes/home.tsx` (welcome/home).
- `npm run dev`, `build`, `typecheck` run successfully.
- PRD documented in `docs/eLicensure-Core-PRD.md`; memory bank initialized from it.

## What’s Left to Build

- [ ] **Layout:** AppLayout, AppShell, top navbar (title, “Demo” badge, avatar), side nav (Dashboard, Applications, New Application, Settings), outlet.
- [ ] **Dashboard (`/`):** SummaryCard(s), ApplicationsTable, “Start New Application” CTA.
- [ ] **Applications list (`/applications`):** Table (ID, facility name, license type, status, last updated), StatusBadge, View → detail.
- [ ] **Application detail (`/applications/$id`):** DetailHeader, tabs (Summary / Form / Timeline), Timeline.
- [ ] **Mock data layer:** listApplications(), getApplication(id), listFacilities(); mock application and facility shapes.
- [ ] **Query layer:** useApplications(), useApplication(id), useFacilities() (TanStack Query or equivalent).
- [ ] **Wizard (`/apply`):** Steps 0–7 (license type, applicant, facility, services & capacity, staffing, infrastructure, type-specific, review & submit); local state; submit adds to mock list and shows confirmation.
- [ ] **UI library:** Add and use shadcn (or equivalent) for forms, inputs, tabs, buttons, etc., per PRD.

## Current Status

- **Phase:** Pre-implementation; memory bank and PRD are the reference; routing/stack decision pending.

## Known Issues

- None yet. Router choice (React Router vs TanStack Router) is an open decision, not a bug.
