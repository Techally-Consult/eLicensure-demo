# Active Context

## Current Focus

- Memory bank has been **initialized** from `docs/eLicensure-Core-PRD.md`.
- No implementation of PRD screens or flows has started yet beyond the initial React Router template.

## Recent Changes

- Created memory-bank core files: projectbrief, productContext, systemPatterns, techContext, activeContext, progress.

## Next Steps

1. **Decide routing:** Implement PRD route tree and layout with **React Router 7** (current) or plan migration to **TanStack Router** (PRD). Document choice in techContext/activeContext.
2. **Add dependencies** (if aligning with PRD): TanStack Query, shadcn (and any required setup).
3. **Implement in order:** AppLayout/AppShell + nav → Dashboard → Applications list → Application detail → Mock API + hooks → Application wizard (steps 0–7).

## Active Decisions / Considerations

- **Router:** PRD says TanStack Router; repo uses React Router 7. Pending: keep React Router and mirror PRD routes, or migrate to TanStack Router.
- **Mock persistence:** Wizard submit “pushes” into in-memory list; for demo, may need a simple in-memory store (e.g. module-level array or React state/context) shared with list/dashboard.
