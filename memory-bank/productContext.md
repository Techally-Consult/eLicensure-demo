# Product Context

## Why This Project Exists

- **Demo** end-to-end facility licensing for stakeholders.
- **Validate** screen structure, navigation, and form UX before integration with real eLicensure backend.

## Problems It Solves

- Lack of a visible, clickable flow for New / Renewal / Additional Service licensing.
- Need to align on screens and steps (applicant, facility, services, staffing, infrastructure, type-specific, review).
- Need a shared reference for layout (navbar, side nav, dashboard, list, detail, wizard).

## How It Should Work

1. **Login:** User selects role (Admin, Applicant, Team Leader, Inspector) and logs in (mock); redirect to Dashboard.
2. **Entry:** Dashboard is role-specific: subtitle and summary cards (Applicant/TL/Admin: in progress, submitted, approved; Inspector: assigned, under inspection, inspection done), same charts and recent list; CTA by role—Applicant/Admin: “Start New Application”; Inspector: “View my inspections”; Team Leader: “Assign inspections.”
3. **List:** `/applications` shows applications filtered by role (Applicant: own; Inspector: assigned to me; Team Leader/Admin: all); “View” → detail. Nav is role-based: Applicant/Admin see Applications (List, New, Renewal, Variation, Additional service); Team Leader and Inspector see Applications (List) and Inspection.
4. **Detail:** Summary / Form / Timeline; Edit → `/apply/$id`; status dropdown (all workflow statuses) updates application and timeline.
5. **Wizard:** `/apply` (New) or `/apply/$id` (edit). For Renewal/Variation/Additional: `/apply?type=renewal|variation|additional` shows **list of applicant’s applications** (Renewal: Approved only). Select one → **Renewal:** read-only detail + “Request renewal” (creates new RENEWAL app, redirect to complete); **Variation:** navigate to `/apply/$id` (full edit); **Additional:** navigate to `/apply/$id?mode=additionalService` (only Services, Staff rows, Type-specific additional editable; rest read-only). Create or save (edit).
6. **Team Leader** (`/team-leader`): Tab “Assign to inspector” — list Submitted, assign inspector per application; Tab “Review inspection” — list Inspection Submitted/Rejected, Approve license or Return to applicant with remark.
7. **Inspector** (`/inspection`): List applications assigned to me; open → inspection detail; submit result (Submitted/Rejected) + remark.
8. **Users** (`/users`, Admin only): List four mock users (name, email, role).

## User Experience Goals

- Clear step-by-step wizard with Next/Back and disabled Next until step is valid.
- Consistent status pills (Draft, Submitted, Under Review, Approved, Rejected).
- Pre-filled facility data when renewal or additional service + existing facility selected.
- Edit from detail pre-fills wizard with full application data; save updates in-memory store.
- Status change on detail updates application and timeline (demo: any transition allowed).
- **In-app notifications:** Bell in header; dropdown with list, mark as read, link to application. Notifications on status change (applicant), assign (inspector), inspection submit (team leader + applicant), approve/return (applicant). Optional: seed notifications per role so each user sees demo content on login.
- Optional toast on “Application submitted (mock).”
