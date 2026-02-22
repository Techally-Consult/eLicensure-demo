# Product Context

## Why This Project Exists

- **Demo** end-to-end facility licensing for stakeholders.
- **Validate** screen structure, navigation, and form UX before integration with real eLicensure backend.

## Problems It Solves

- Lack of a visible, clickable flow for New / Renewal / Additional Service licensing.
- Need to align on screens and steps (applicant, facility, services, staffing, infrastructure, type-specific, review).
- Need a shared reference for layout (navbar, side nav, dashboard, list, detail, wizard).

## How It Should Work

1. **Entry:** User lands on Dashboard with summary cards (in progress, submitted, approved), charts (by status, over time), and recent applications; “Start New Application” leads to `/apply`.
2. **List:** `/applications` shows all applications with ID, facility name, license type, status, last updated; “View” goes to detail.
3. **Detail:** `/applications/$id` shows application with Summary / Form / Timeline tabs; **Edit** button links to `/apply/$id`; **status dropdown** (Draft, Submitted, Under Review, Approved, Rejected) updates application and timeline. Form tab shows full form data (applicant, facility, services, capacity & staffing, infrastructure, type-specific).
4. **Wizard:** `/apply` (new) or `/apply/$id` (edit). Edit pre-fills wizard from application. Steps: license type → applicant → facility (new or select existing) → services & capacity → staffing → infrastructure → type-specific → review & submit. Submit creates (new) or saves changes (edit); success screen links to list and detail.

## User Experience Goals

- Clear step-by-step wizard with Next/Back and disabled Next until step is valid.
- Consistent status pills (Draft, Submitted, Under Review, Approved, Rejected).
- Pre-filled facility data when renewal or additional service + existing facility selected.
- Edit from detail pre-fills wizard with full application data; save updates in-memory store.
- Status change on detail updates application and timeline (demo: any transition allowed).
- Optional toast/alert on “Application submitted (mock)”.
