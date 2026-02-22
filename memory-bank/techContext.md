# Tech Context

## PRD Stack (Target)

- **Routing:** TanStack Router (routes, layouts, static data).
- **Data:** TanStack Query (mock API, hooks).
- **UI:** shadcn + Tailwind (forms, inputs, tabs, buttons, etc.).

## Current Repo

- **Router:** TanStack Router (`@tanstack/react-router`) – migrated from React Router 7.
- **Auth (mock):** React context (AuthProvider in main.tsx); `app/contexts/AuthContext.tsx`; `app/data/mockAuth.ts` (4 users, sessionStorage); no real auth.
- **Data:** TanStack Query; mock API in `app/data/mockApi.ts` (listApplications(role, userId) for role-filtered list, get + mutations; mutations emit in-app notifications). Apply wizard: renewal/variation/additional use application list → select then type-specific flow (renewal creates new app with sourceApplicationId; additional uses ?mode=additionalService for partial edit). Notifications: `app/data/mockNotifications.ts` (store, addNotification, getNotifications, markRead, subscribe); `app/hooks/useNotifications.ts`. Optional seed: seedNotifications() for demo notifications per role.
- **UI:** Tailwind CSS 4; shadcn in `app/components/ui/` (button, input, label, textarea, select, checkbox, radio-group, tabs, card); Radix + CVA.
- **React:** 19.x.
- **Build:** Vite 7, TypeScript 5.9.
- **Scripts:** `pnpm run dev`, `pnpm run build`, `pnpm run typecheck` (Vite + tsc).

## Decision (Router)

- **Chosen:** TanStack Router (per PRD). Migration from React Router 7 completed.

## Technical Constraints

- Static/mock data only; no real API; mock auth (role selection, sessionStorage).
- TypeScript throughout.
- Tailwind for layout and spacing (`container`, `max-w-3xl`, `mx-auto`, `flex`, `gap-4`).

## Dependencies

- react, react-dom, @tanstack/react-router, @tanstack/react-query.
- tailwindcss, @tailwindcss/vite, @vitejs/plugin-react, vite, vite-tsconfig-paths, typescript, @types/*.
- shadcn/ui components (Radix: react-tabs, react-label, react-select, react-checkbox, react-radio-group, slot); class-variance-authority (cva).
- recharts for dashboard charts (Applications by status, Applications over time).
