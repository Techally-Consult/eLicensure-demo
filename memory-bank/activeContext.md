# Active Context

## Current Focus

- **Detail tabs:** Application detail page now has Summary / Form / Timeline tabs and Timeline component. Next: optional polish or shadcn.

## Recent Changes

- **Application detail:** Tabs (Summary, Form, Timeline) with local tab state. Summary tab: facility, last updated, applicant, services. Form tab: read-only Applicant (name, ID, phone, email, role), Facility (name, type, ownership, region, woreda, license number), Services list. Timeline tab: Timeline component with status history (Created, Submitted, status changes). TimelineEvent type and optional `timeline` on Application; seed data and submitApplication() set timeline for new applications. `app/components/Timeline.tsx` renders vertical list with date and label.

## Next Steps

1. **Optional:** shadcn init for richer form/tab components; or polish (e.g. empty states, validation messages).

## Active Decisions / Considerations

- **Router:** TanStack Router (decided and implemented).
- **Mock persistence:** Wizard submit pushes into in-memory store shared with list/dashboard (mock API module).
