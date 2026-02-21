# Active Context

## Current Focus

- **Data layer:** Mock API and query hooks are in place; Dashboard, Applications list, and Application detail are wired to data. Next: full wizard (steps 0–7) with local state and mock submit.

## Recent Changes

- **Mock API + hooks:** Types in `app/types/` (Application, Facility); in-memory store and async API in `app/data/mockApi.ts` (listApplications, getApplication, listFacilities, submitApplication); hooks in `app/hooks/` (useApplications, useApplication, useFacilities). Shared StatusBadge in `app/components/StatusBadge.tsx`.
- Dashboard, Applications list, and Application detail pages now use the hooks and display seed data (summary counts, table with View link, detail summary).

## Next Steps

1. **Wizard (steps 0–7):** License type → applicant → facility → services → staffing → infrastructure → type-specific → review & submit; local state; submit calls submitApplication and invalidates applications query.
2. **Application detail:** Add tabs (Summary / Form / Timeline) and Timeline component.
3. **shadcn (optional):** Run `pnpm dlx shadcn@latest init` when adding Form/Tabs components for wizard.

## Active Decisions / Considerations

- **Router:** TanStack Router (decided and implemented).
- **Mock persistence:** Wizard submit pushes into in-memory store shared with list/dashboard (mock API module).
