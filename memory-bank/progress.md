# Progress

## What Works

- **Stack:** TanStack Router, TanStack Query, React 19, Tailwind 4, Vite 7, TypeScript.
- **Routing:** Route tree and layout as above; Dashboard, Applications list, Application detail, Apply (wizard placeholder).
- **Data layer:** Types in `app/types/application.ts` and `app/types/facility.ts`. Mock API in `app/data/mockApi.ts`: listApplications(), getApplication(id), listFacilities(), submitApplication(); seed data (3 applications, 2 facilities).
- **Query hooks:** useApplications(), useApplication(id), useFacilities() in `app/hooks/`.
- **Dashboard:** Summary cards (in progress / submitted / approved) from data; recent applications list with View link; “Start New Application” CTA.
- **Applications list:** Table (ID, facility name, license type, status, last updated), StatusBadge, View → detail.
- **Application detail:** Header (ID, status badge, license type); tabs Summary / Form / Timeline. Summary: facility, last updated, applicant, services. Form: read-only Applicant, Facility, Services. Timeline: Timeline component with status history (from application.timeline or fallback Created + status). Uses useApplication(id).
- **Shared:** StatusBadge in `app/components/StatusBadge.tsx`.
- **Application Wizard (`/apply`):** Steps 0–7 with local WizardState; step indicator; Back/Next/Submit; type-specific forms for New, Renewal, Additional service; Submit calls submitApplication, invalidates applications query, shows success and links to list/detail.
- **Scripts:** `pnpm run dev`, `pnpm run build`, `pnpm run typecheck` succeed.

## What’s Left to Build

- [ ] **shadcn (optional):** Run `pnpm dlx shadcn@latest init` and add components as needed.
- [ ] **Polish (optional):** Empty states, validation messaging, accessibility.

## Current Status

- **Phase:** PRD scope complete: layout, Dashboard, Applications list, Application detail (with tabs and Timeline), wizard (steps 0–7), mock API and hooks. Optional: shadcn, polish.

## Known Issues

- None. shadcn not yet initialized (optional; run init when adding form/tab components).
