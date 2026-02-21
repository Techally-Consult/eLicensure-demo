# System Patterns

## Route Tree (Implemented)

- `/` → Dashboard
- `/applications` → Application list (index under `applications` layout)
- `/applications/$id` → Application detail
- `/apply` → Application wizard

Defined in `app/routeTree.tsx` (manual tree); root layout is AppLayout; `applications` has a layout route that renders `<Outlet />` for list and detail.

## Layout Architecture

- **AppLayout:** Implemented in `app/layouts/AppLayout.tsx`. Top navbar (eLicensure title, “Demo” badge, avatar placeholder), side nav with TanStack Router `Link` (Dashboard, Applications, New Application, Settings placeholder), main content area with `<Outlet />`.
- **AppShell:** Same as AppLayout in this codebase (single layout component).
- **NavLink:** Using `Link` from `@tanstack/react-router` with `activeProps` for active styling.

## Data & State

- **Mock API (async):** Implemented in `app/data/mockApi.ts`. `listApplications()`, `getApplication(id)`, `listFacilities()` with small delay; in-memory stores; `submitApplication(application)` for wizard submit.
- **Query hooks:** `useApplications()`, `useApplication(id)`, `useFacilities()` in `app/hooks/`, wired to TanStack Query.
- **Wizard state (local):** To be in `ApplicationWizardPage`: `licenseType`, `applicant`, `facility`, `services`, `staffing`, `infrastructure`, `typeSpecific`. On Submit, call `submitApplication()` and invalidate applications query.

## Mock Data Shapes

- **Application:** id, licenseType, facilityName, status, lastUpdated; nested applicant, facility, services, etc.
- **Facility:** id, mfrId, name, type, licenseNumber, services[].

## Key Components

| Screen / Area | Components |
|---------------|------------|
| Layout | AppShell, NavLink list |
| Dashboard | SummaryCard, ApplicationsTable, “Start New Application” CTA |
| Applications list | ApplicationsTable, StatusBadge, row “View” action |
| Application detail | DetailHeader, Tabs (Summary / Form / Timeline), Timeline (status history; `app/components/Timeline.tsx`) |
| Wizard | Form/FormField/FormItem/FormLabel/FormControl/FormMessage, RadioGroup, Input, Textarea, Select, Checkbox, Stepper (or step indicator), Button |

## Design Patterns

- One wizard component for all three license types; step content varies by `licenseType` (e.g. Step 2: new vs select facility; Step 6: new vs renewal vs additional service).
- Read-only detail: no edit; display same data as entered in wizard.
- Status lifecycle in mock: Draft → Submitted (and optionally Under Review, Approved, Rejected) for demo.
