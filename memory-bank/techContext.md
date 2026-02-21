# Tech Context

## PRD Stack (Target)

- **Routing:** TanStack Router (routes, layouts, static data).
- **Data:** TanStack Query (mock API, hooks).
- **UI:** shadcn + Tailwind (forms, inputs, tabs, buttons, etc.).

## Current Repo (As of Memory Bank Init)

- **Router:** React Router 7 (`react-router`, `@react-router/*`).
- **React:** 19.x.
- **Styling:** Tailwind CSS 4 (`tailwindcss`, `@tailwindcss/vite`).
- **Build:** Vite 7, TypeScript 5.9.
- **Scripts:** `npm run dev`, `npm run build`, `npm run start`, `npm run typecheck` (react-router typegen + tsc).

## Gap vs PRD

- PRD specifies **TanStack Router**; repo uses **React Router 7**. Decision: either migrate to TanStack Router or implement same route tree and flows with React Router (document in activeContext).
- **TanStack Query** and **shadcn** are not yet in the project; to be added when implementing data and UI per PRD.

## Technical Constraints

- Static/mock data only; no real API or auth.
- TypeScript throughout.
- Tailwind for layout and spacing (`container`, `max-w-3xl`, `mx-auto`, `flex`, `gap-4`).

## Dependencies (Current)

- react, react-dom, react-router, @react-router/node, @react-router/serve, @react-router/dev, isbot.
- tailwindcss, @tailwindcss/vite, vite, vite-tsconfig-paths, typescript, @types/*.
