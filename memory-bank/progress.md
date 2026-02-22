# Progress

## What Works

- **Stack:** TanStack Router, TanStack Query, React 19, Tailwind 4, Vite 7, TypeScript, shadcn UI, Recharts.
- **Routing:** Route tree with Dashboard, Applications list, Application detail, Apply (new and edit at `/apply` and `/apply/$id`).
- **Data layer:** Types in `app/types/application.ts` (Application, ApplicantInfo, FacilityInfo, ServiceItem, StaffingHead, StaffRow, TypeSpecific*, TimelineEvent) and `app/types/facility.ts`. Mock API in `app/data/mockApi.ts`: listApplications(), getApplication(id), listFacilities(), submitApplication(payload), updateApplication(id, payload), updateApplicationStatus(id, newStatus). **12 seed applications** with full-form data (applicant, facility, facilityId where applicable, services, totalBeds, staffingHead, staffRows, infrastructureDescription, typeSpecific). 2 facilities in store.
- **Query hooks:** useApplications(), useApplication(id), useFacilities() in `app/hooks/`. Invalidation on submit/update/status change.
- **Dashboard:** Summary cards (in progress / submitted / approved), charts (Applications by status, Applications over time), “Start New Application” CTA, recent applications list with View link.
- **Applications list:** Table (ID, facility name, license type, status, last updated), StatusBadge, View → detail.
- **Application detail:** Header (ID, status badge, license type); **Edit** button → `/apply/$id`; **Status** Select (Draft, Submitted, Under Review, Approved, Rejected) calling updateApplicationStatus; tabs Summary / Form / Timeline. Form tab: Applicant (incl. authLetterRef), Facility, Services, Capacity & staffing (totalBeds, staffingHead, staffRows), Infrastructure, Type-specific (new/renewal/additional). Timeline from application.timeline or fallback.
- **Application Wizard:** `/apply` (new) and `/apply/$id` (edit). Steps 0–7 with shadcn Tabs + Card; Step 0 RadioGroup for license type. When editing, application loaded into wizard state via applicationToWizardState; Submit → updateApplication(id, fullPayload) and “Application saved” or submitApplication and “Application submitted”. Full payload includes applicant, facility, facilityId, services, totalBeds, staffingHead, staffRows, infrastructureDescription, typeSpecific.
- **Shared:** StatusBadge, Timeline, ApplicationsByStatusChart, ApplicationsOverTimeChart; shadcn components in `app/components/ui/`.
- **Scripts:** `pnpm run dev`, `pnpm run build`, `pnpm run typecheck` succeed.

## What’s Left to Build

- [ ] **Optional:** Toast (sonner) for submit/save confirmation; more wizard inputs as shadcn Input/Label/Select; empty states, a11y polish.

## Current Status

- **Phase:** PRD scope complete; full-form seed data; edit flow and status change implemented. Optional: toast, form primitives, polish.

## Known Issues

- None.
