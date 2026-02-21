# Active Context

## Current Focus

- **Wizard:** Full Application Wizard (steps 0–7) is implemented. Next: Application detail tabs (Summary / Form / Timeline) and Timeline, or shadcn for richer form components.

## Recent Changes

- **Application Wizard (`/apply`):** Single-page wizard with local state (WizardState). Steps: 0 License type (radio), 1 Applicant (name, ID, phone, email, role, auth letter ref), 2 Facility (new: name/type/ownership/region/woreda; renewal/additional: facility dropdown from useFacilities()), 3 Services & capacity (checkboxes + level/beds per service, total beds), 4 Staffing (facility head + addable staff rows), 5 Infrastructure (layout description + floor plan placeholder), 6 Type-specific (new: start date, construction status, ready for inspection; renewal: license dates, changes, inspection; additional: current services, new services table, justification, impact), 7 Review & submit. Submit builds payload, calls submitApplication(), invalidates applications query, shows success with links to list and new application.

## Next Steps

1. **Application detail:** Add tabs (Summary / Form / Timeline) and Timeline component.
2. **shadcn (optional):** Run `pnpm dlx shadcn@latest init` when adding Form/Tabs components.

## Active Decisions / Considerations

- **Router:** TanStack Router (decided and implemented).
- **Mock persistence:** Wizard submit pushes into in-memory store shared with list/dashboard (mock API module).
