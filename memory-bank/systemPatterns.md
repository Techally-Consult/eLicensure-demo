# System Patterns

## Route Tree (Implemented)

- `/` → Dashboard
- `/applications` → Application list (index under `applications` layout)
- `/applications/$id` → Application detail
- `/apply` → Application wizard (new)
- `/apply/$id` → Application wizard (edit; same component, loads application and saves via updateApplication)

Defined in `app/routeTree.tsx` (manual tree); root layout is AppLayout; `applications` has a layout route that renders `<Outlet />` for list and detail; `apply` has a layout route that renders `<Outlet />` for index (new) and `$id` (edit).

## Layout Architecture

- **AppLayout:** Implemented in `app/layouts/AppLayout.tsx`. Top navbar (eLicensure title, “Demo” badge, avatar placeholder), side nav with TanStack Router `Link` (Dashboard, Applications, New Application, Settings placeholder), main content area with `<Outlet />`.
- **AppShell:** Same as AppLayout in this codebase (single layout component).
- **NavLink:** Using `Link` from `@tanstack/react-router` with `activeProps` for active styling.

## Data & State

- **Mock API (async):** Implemented in `app/data/mockApi.ts`. `listApplications()`, `getApplication(id)`, `listFacilities()` with small delay; in-memory stores; **`submitApplication(payload)`** for wizard create (full payload); **`updateApplication(id, payload)`** for wizard edit (merge, timeline unchanged); **`updateApplicationStatus(id, newStatus)`** for detail status change (updates status and appends timeline event).
- **Query hooks:** `useApplications()`, `useApplication(id)`, `useFacilities()` in `app/hooks/`, wired to TanStack Query. Invalidate `applicationsQueryKey` and `applicationQueryKey(id)` after submit/update/status change.
- **Wizard state (local):** In `ApplicationWizardPage`: `licenseType`, `applicant`, `facilityId`/`facilityNew`, `services`, `totalBeds`, `staffingHead`, `staffRows`, `infrastructureDescription`, `typeSpecific`. When route has `id`, state is initialized from `applicationToWizardState(application, facilities)` once. On Submit: if `id` → `updateApplication(id, fullPayload)`; else → `submitApplication({ ...fullPayload, status: 'Submitted' })`.

## Mock Data Shapes

- **Application:** id, licenseType, facilityName, status, lastUpdated, timeline; optional applicant, facility, facilityId, services, totalBeds, staffingHead, staffRows, infrastructureDescription, typeSpecific (new/renewal/additional). Full form stored for edit round-trip.
- **Facility:** id, mfrId, name, type, licenseNumber, services[].

## Key Components

| Screen / Area | Components |
|---------------|------------|
| Layout | AppShell, NavLink list |
| Dashboard | SummaryCard, ApplicationsTable, “Start New Application” CTA |
| Applications list | ApplicationsTable, StatusBadge, row “View” action |
| Application detail | DetailHeader, Edit (Link to `/apply/$id`), Status Select (updateApplicationStatus), Tabs (Summary / Form / Timeline), Form tab shows full fields (applicant, facility, services, capacity & staffing, infrastructure, type-specific), Timeline (status history; `app/components/Timeline.tsx`) |
| Wizard | Form/FormField/FormItem/FormLabel/FormControl/FormMessage, RadioGroup, Input, Textarea, Select, Checkbox, Stepper (or step indicator), Button |

## Design Patterns

- One wizard component for all three license types and for both create and edit; step content varies by `licenseType` (e.g. Step 2: new vs select facility; Step 6: new vs renewal vs additional service). Edit: load application into wizard state via `applicationToWizardState`, save via `updateApplication`.
- Detail: read-only Form tab; **Edit** opens wizard at `/apply/$id`; **status Select** updates application and timeline via `updateApplicationStatus`.
- Status lifecycle in mock: any transition allowed (Draft, Submitted, Under Review, Approved, Rejected); status change appends to timeline.
