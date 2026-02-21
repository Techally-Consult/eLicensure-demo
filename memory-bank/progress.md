# Progress

## What Works

- **Stack:** TanStack Router, TanStack Query, React 19, Tailwind 4, Vite 7, TypeScript.
- **Routing:** Route tree and layout as above; Dashboard, Applications list, Application detail, Apply (wizard placeholder).
- **Data layer:** Types in `app/types/application.ts` and `app/types/facility.ts`. Mock API in `app/data/mockApi.ts`: listApplications(), getApplication(id), listFacilities(), submitApplication(); seed data (3 applications, 2 facilities).
- **Query hooks:** useApplications(), useApplication(id), useFacilities() in `app/hooks/`.
- **Dashboard:** Summary cards (in progress / submitted / approved) from data; recent applications list with View link; “Start New Application” CTA.
- **Applications list:** Table (ID, facility name, license type, status, last updated), StatusBadge, View → detail.
- **Application detail:** Header (ID, status badge, license type), Summary section (facility, last updated, applicant); uses useApplication(id).
- **Shared:** StatusBadge in `app/components/StatusBadge.tsx`.
- **Scripts:** `pnpm run dev`, `pnpm run build`, `pnpm run typecheck` succeed.

## What’s Left to Build

- [ ] **Wizard (`/apply`):** Steps 0–7 in full; local state; submit calls submitApplication and invalidates applications query; optional toast on success.
- [ ] **Application detail:** Tabs (Summary / Form / Timeline), Timeline component.
- [ ] **shadcn:** Run `pnpm dlx shadcn@latest init` and add components as needed.

## Current Status

- **Phase:** Mock API + hooks done; Dashboard, list, and detail wired. Next: full wizard (steps 0–7).

## Known Issues

- None. shadcn not yet initialized (optional; run init when adding form/tab components).
