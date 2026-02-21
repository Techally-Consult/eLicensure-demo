# Active Context

## Current Focus

- **Router:** TanStack Router adopted and migrated. Layout (AppLayout/AppShell) and placeholder pages (Dashboard, Applications list, Detail, Apply) are in place. Next: mock API + hooks, then full wizard (steps 0–7).

## Recent Changes

- Documented TanStack Router decision in techContext and activeContext.
- Migrated to TanStack Router: new route tree (`app/routeTree.tsx`), `app/main.tsx` with RouterProvider + QueryClientProvider, AppLayout with nav, placeholder pages; removed React Router and related config.
- TanStack Query added and provided in main.tsx. shadcn not yet initialized (run `pnpm dlx shadcn@latest init` when needed).

## Next Steps

1. **Mock API + query hooks (recommended next):** Define types and in-memory store; implement listApplications(), getApplication(id), listFacilities(); add useApplications(), useApplication(id), useFacilities() with TanStack Query. Enables wiring Dashboard and Applications list to real data.
2. **Wire Dashboard & Applications list:** Use hooks in pages; add ApplicationsTable with columns, StatusBadge; Dashboard summary counts from data.
3. **Application detail:** DetailHeader, tabs (Summary / Form / Timeline), Timeline.
4. **Wizard (steps 0–7):** Full flow with local state; mock submit that pushes to in-memory store.
5. **shadcn (optional):** Run `pnpm dlx shadcn@latest init` when adding Form/Tabs/Button components.

## Active Decisions / Considerations

- **Router:** TanStack Router (decided and implemented).
- **Mock persistence:** Wizard submit pushes into in-memory store shared with list/dashboard (mock API module).
