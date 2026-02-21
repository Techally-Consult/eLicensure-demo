# Progress

## What Works

- **Stack:** TanStack Router, TanStack Query, React 19, Tailwind 4, Vite 7, TypeScript.
- **Routing:** Route tree: `/` (Dashboard), `/applications` (list), `/applications/$id` (detail), `/apply` (wizard). `app/routeTree.tsx` + `app/main.tsx` with RouterProvider and QueryClientProvider.
- **Layout:** AppLayout with top navbar (eLicensure title, “Demo” badge, avatar placeholder), side nav (Dashboard, Applications, New Application, Settings placeholder), main outlet.
- **Pages (placeholders):** DashboardPage (summary cards 0/0/0, “Start New Application” CTA), ApplicationsListPage, ApplicationDetailPage (shows id), ApplicationWizardPage.
- **Scripts:** `pnpm run dev`, `pnpm run build`, `pnpm run typecheck` succeed.
- **App structure:** `app/main.tsx` (entry), `app/routeTree.tsx` (routes), `app/layouts/AppLayout.tsx`, `app/pages/*.tsx`, `app/app.css`.

## What’s Left to Build

- [ ] **Dashboard:** Wire SummaryCard counts and ApplicationsTable to mock data.
- [ ] **Applications list:** Table with columns (ID, facility name, license type, status, last updated), StatusBadge, View → detail.
- [ ] **Application detail:** DetailHeader, tabs (Summary / Form / Timeline), Timeline.
- [ ] **Mock data layer:** listApplications(), getApplication(id), listFacilities(); mock application and facility shapes.
- [ ] **Query hooks:** useApplications(), useApplication(id), useFacilities() using TanStack Query.
- [ ] **Wizard (`/apply`):** Steps 0–7 in full; local state; submit adds to mock list and shows confirmation.
- [ ] **shadcn:** Run `pnpm dlx shadcn@latest init` and add components (Form, Button, Tabs, etc.) as needed.

## Current Status

- **Phase:** Layout and routing done; placeholder pages in place. Next: mock API + hooks, then list/detail wiring, then full wizard.

## Known Issues

- None. shadcn not yet initialized (optional; run init when adding form/tab components).
