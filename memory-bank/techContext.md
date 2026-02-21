# Tech Context

## PRD Stack (Target)

- **Routing:** TanStack Router (routes, layouts, static data).
- **Data:** TanStack Query (mock API, hooks).
- **UI:** shadcn + Tailwind (forms, inputs, tabs, buttons, etc.).

## Current Repo

- **Router:** TanStack Router (`@tanstack/react-router`) – migrated from React Router 7.
- **Data:** TanStack Query (`@tanstack/react-query`) in place; mock API layer and hooks not yet implemented.
- **UI:** Tailwind CSS 4 for layout and styling. shadcn not yet added (run `pnpm dlx shadcn@latest init` when needed).
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
- shadcn/ui to be added when implementing forms/tabs (optional until wizard).
