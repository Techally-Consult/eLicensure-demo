# Active Context

## Current Focus

- **Full-form seed + edit + status:** Implemented. Seed applications have all wizard fields; detail has Edit and status change; wizard supports create and edit with full payload save.

## Recent Changes

- **Application model extended:** `Application` now includes `facilityId`, `totalBeds`, `staffingHead`, `staffRows`, `infrastructureDescription`, `typeSpecific` (new/renewal/additional), and `ApplicantInfo.authLetterRef`. Types in `app/types/application.ts`.
- **Mock API:** `submitApplication(payload)` accepts full payload; **`updateApplication(id, payload)`** merges into existing (timeline never overwritten); **`updateApplicationStatus(id, newStatus)`** updates status and appends timeline event. `app/data/mockApi.ts`.
- **Seed data:** All 12 applications populated with full applicant, facility, services, totalBeds, staffingHead, staffRows, infrastructureDescription, and typeSpecific by license type. RENEWAL/ADDITIONAL use `facilityId` where facility matches store (e.g. fac-1, fac-2).
- **Routes:** `/apply` (new) and `/apply/$id` (edit) both render `ApplicationWizardPage`; apply layout has index and `$id` child routes in `app/routeTree.tsx`.
- **Wizard edit:** Reads `id` from params; when `id` present uses `useApplication(id)` and `applicationToWizardState(application, facilities)` to prefill state (once per id). Submit builds full payload; if `id` calls `updateApplication(id, payload)` and shows “Application saved”; else `submitApplication({ ...payload, status: 'Submitted' })`. Button label “Save changes” when editing, “Submit application” when new.
- **Detail page:** **Edit** button → `/apply/$id`. **Status** Select (Draft, Submitted, Under Review, Approved, Rejected) calls `updateApplicationStatus(id, newStatus)` and invalidates queries. **Form tab** extended: applicant (incl. authLetterRef), facility, services, Capacity & staffing (totalBeds, staffingHead, staffRows), Infrastructure, Type-specific (new/renewal/additional).

## Next Steps

1. **Optional:** Toast (sonner) for submit/save confirmation; more wizard inputs as shadcn Input/Label/Select; empty states, a11y polish.

## Active Decisions / Considerations

- **Router:** TanStack Router (decided and implemented). Apply has optional `$id` for edit.
- **Mock persistence:** In-memory store; create (submitApplication), update (updateApplication), status change (updateApplicationStatus) all mutate store; TanStack Query invalidates list and single-application queries.
- **Edit flow:** Single wizard component for both new and edit; route param `id` drives load vs create and submit vs save.
