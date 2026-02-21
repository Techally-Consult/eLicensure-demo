# System Patterns

## Route Tree (PRD)

- `/` → Dashboard
- `/applications` → Application list
- `/applications/$id` → Application detail
- `/apply` → Application wizard

Route metadata (e.g. titles) via static route data where useful.

## Layout Architecture

- **AppLayout:** Wraps all pages; provides top navbar (app title, “Demo” badge, user avatar placeholder) and side nav (Dashboard, Applications, New Application, Settings).
- **AppShell:** Flex layout: sidebar + main content area that renders current route outlet.
- **NavLink:** Router-aware links for side nav.

## Data & State

- **Mock API (async):** `listApplications()`, `getApplication(id)`, `listFacilities()` – simulate network; wire to TanStack Query.
- **Query hooks:** `useApplications()`, `useApplication(id)`, `useFacilities()`.
- **Wizard state (local):** In `ApplicationWizardPage`: `licenseType`, `applicant`, `facility`, `services`, `staffing`, `infrastructure`, `typeSpecific`. Use `useState` or `useReducer`; on Submit, push new application into in-memory list (demo only).

## Mock Data Shapes

- **Application:** id, licenseType, facilityName, status, lastUpdated; nested applicant, facility, services, etc.
- **Facility:** id, mfrId, name, type, licenseNumber, services[].

## Key Components

| Screen / Area | Components |
|---------------|------------|
| Layout | AppShell, NavLink list |
| Dashboard | SummaryCard, ApplicationsTable, “Start New Application” CTA |
| Applications list | ApplicationsTable, StatusBadge, row “View” action |
| Application detail | DetailHeader, Tabs (Summary / Form / Timeline), Timeline |
| Wizard | Form/FormField/FormItem/FormLabel/FormControl/FormMessage, RadioGroup, Input, Textarea, Select, Checkbox, Stepper (or step indicator), Button |

## Design Patterns

- One wizard component for all three license types; step content varies by `licenseType` (e.g. Step 2: new vs select facility; Step 6: new vs renewal vs additional service).
- Read-only detail: no edit; display same data as entered in wizard.
- Status lifecycle in mock: Draft → Submitted (and optionally Under Review, Approved, Rejected) for demo.
