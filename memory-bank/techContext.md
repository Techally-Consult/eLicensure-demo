# Tech Context

## PRD Stack (Target)

- **Routing:** TanStack Router (routes, layouts, static data).
- **Data:** TanStack Query (mock API, hooks).
- **UI:** shadcn + Tailwind (forms, inputs, tabs, buttons, etc.).

## Current Repo

- **Router:** TanStack Router (`@tanstack/react-router`) – migrated from React Router 7.
- **Data:** TanStack Query (`@tanstack/react-query`) in place; mock API in `app/data/mockApi.ts` (listApplications, getApplication, listFacilities, submitApplication, updateApplication, updateApplicationStatus); hooks in `app/hooks/` (useApplications, useApplication, useFacilities).
- **UI:** Tailwind CSS 4 for layout and styling. shadcn components in `app/components/ui/` (button, input, label, textarea, select, checkbox, radio-group, tabs, card); Radix primitives and CVA used.
- **React:** 19.x.
- **Build:** Vite 7, TypeScript 5.9.
- **Scripts:** `pnpm run dev`, `pnpm run build`, `pnpm run typecheck` (Vite + tsc).

## Decision (Router)

- **Chosen:** TanStack Router (per PRD). Migration from React Router 7 completed.

## Technical Constraints

- Static/mock data only; no real API or auth.
- TypeScript throughout.
- Tailwind for layout and spacing (`container`, `max-w-3xl`, `mx-auto`, `flex`, `gap-4`).

## Dependencies

- react, react-dom, @tanstack/react-router, @tanstack/react-query.
- tailwindcss, @tailwindcss/vite, @vitejs/plugin-react, vite, vite-tsconfig-paths, typescript, @types/*.
- shadcn/ui components (Radix: react-tabs, react-label, react-select, react-checkbox, react-radio-group, slot); class-variance-authority (cva).
- recharts for dashboard charts (Applications by status, Applications over time).
