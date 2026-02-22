# Active Context

## Current Focus

- **Notifications:** Implemented (mock store, bell + dropdown, emit on status/assign/inspection/approve/return). Next: **seed notifications for all roles** so each user has demo notifications on first load.

## Recent Changes

- **Renewal, Variation, Additional Service flows:** When `/apply?type=renewal|variation|additional` (no id), ApplicationWizardPage shows an **application list** first (useApplications(); Renewal filters to Approved only). On select: **Renewal** → read-only detail of selected app + “Request renewal” button; creates **new** RENEWAL application (copied from selected, `sourceApplicationId` set), redirect to `/apply/$newId`. **Variation** → navigate to `/apply/$id` (full edit). **Additional** → navigate to `/apply/$id?mode=additionalService`; wizard shows all steps but only Services & capacity, Staff rows, Type-specific (additional) are editable; Applicant, Facility, Infrastructure, Staffing head are read-only. Application type has **sourceApplicationId** (optional, for RENEWAL). Docs: `docs/application-features-and-flows.md` and `docs/plan-renewal-variation-additional-flows.md`.
- **Application list by role + seed data:** `Application` has `applicantUserId?: string`. `listApplications(options?: { role, userId })` filters: Applicant → applicantUserId === userId; Inspector → assignedTo === userId; Team Leader/Admin → all. All 12 seed applications have `applicantUserId: "user-applicant"`; APP-002, APP-006, APP-011 have `assignedTo: "user-inspector"` (statuses Assigned, Under Inspection, Inspection Submitted). `useApplications()` uses `useAuth()`, calls `listApplications({ role: user?.role, userId: user?.id })`, query key includes role and userId. ApplicationWizardPage passes `applicantUserId: user?.id` on create. Applications list, dashboard, and any consumer of `useApplications()` now see role-appropriate data.
- **Dashboard by role:** DashboardPage uses `useAuth()`; subtitle via `getDashboardSubtitle(role)` (Applicant / Inspector / Team Leader / Admin). Summary cards: Applicant, Team Leader, Admin see “Applications in progress,” “Submitted,” “Approved”; Inspector sees “Assigned,” “Under inspection,” “Inspection done.” CTA: Applicant & Admin → “Start New Application” (/apply); Inspector → “View my inspections” (/inspection); Team Leader → “Assign inspections” (/team-leader). Charts and recent applications unchanged (data already filtered by useApplications()).
- **In-app notifications:** `app/types/notification.ts` (Notification: id, userId, applicationId?, type, message, read, createdAt). `app/data/mockNotifications.ts`: in-memory store per userId; getNotifications(userId), addNotification(userId, payload), markNotificationRead(userId, id), markAllNotificationsRead(userId), subscribeNotifications(listener). mockApi emits: updateApplicationStatus → applicant (user-applicant); assignApplication → inspector (assignedTo); submitInspection → team leader (user-tl) + applicant; approveLicense / returnToApplicant → applicant. `app/hooks/useNotifications.ts`: useNotifications(userId) returns notifications, unreadCount, markRead, markAllRead; subscribes for live updates. `app/components/NotificationsDropdown.tsx`: bell icon + unread badge, dropdown with list, “Mark all read,” click notification → mark read + link to application + close. AppLayout header shows NotificationsDropdown when user logged in.

## Earlier Changes

- **Auth:** `app/types/auth.ts` (UserRole: Admin, Applicant, Team Leader, Inspector; User). `app/data/mockAuth.ts`: 4 mock users, getStoredUser/setStoredUser (sessionStorage), getUsersByRole. `app/contexts/AuthContext.tsx`: AuthProvider, useAuth (user, login(role), logout). Login page at `/login` (role select + Log in). RootLayout: unauthenticated → redirect to /login; else render AppLayout with Outlet. main.tsx wrapped with AuthProvider.
- **Application status flow:** New statuses Assigned, Under Inspection, Inspection Submitted, Inspection Rejected. Application.assignedTo, Application.inspection (InspectionResult), Application.remark; TimelineEvent.remark. Mock API: assignApplication(id, inspectorId), setUnderInspection(id), submitInspection(id, result, remark, submittedBy), approveLicense(id), returnToApplicant(id, remark). updateApplicationStatus(id, status, remark?). StatusBadge and ApplicationDetailPage STATUS_OPTIONS extended; ApplicationsByStatusChart STATUS_ORDER extended.
- **Menu (AppLayout):** Role-based. Header: user name, role, Log out. Sidebar: Dashboard; Applications (List for all; New, Renewal, Variation, Additional service for Applicant/Admin); Inspection (Team Leader → /team-leader, Inspector → /inspection); Users (Admin only).
- **Team Leader:** `/team-leader` — tabs Assign to inspector (list Submitted, assign inspector via Select), Review inspection (list Inspection Submitted/Rejected, Approve or Return to applicant with remark). Route protected (Team Leader, Admin).
- **Inspector:** `/inspection` list (applications where assignedTo === current user); `/inspection/$id` detail (summary + submit inspection: Submitted/Rejected + remark). Opening detail sets status Under Inspection if Assigned. Route protected (Inspector, Admin).
- **Users:** `/users` lists 4 mock users; Admin only, redirect others to /.
- **Wizard:** For type=renewal|variation|additional (no id), first screen is application list; after select, Renewal shows detail + Request renewal; Variation goes to full edit; Additional goes to /apply/$id?mode=additionalService (partial edit). New application (no type) and direct /apply/$id unchanged.
- **AppLayout:** Accepts optional children (RootLayout passes <Outlet />) so child routes render inside layout.

## Next Steps (Plan)

1. **Seed notifications for all roles:** So each of the 4 users sees demo notifications when they log in (no empty bell). Plan below.
2. **Toast (optional):** Sonner for submit/save and assign/inspection actions.
3. **Polish (optional):** Empty states, a11y, more shadcn in wizard.
4. **VARIATION license type (optional):** Add VARIATION to LicenseType if product needs it.

### Plan: Seeding notification data for all roles

- **Goal:** On first load (or when notification store is empty), pre-populate 2–4 notifications per user so Applicant, Team Leader, Inspector, and Admin each see relevant demo notifications in the bell dropdown.
- **Where:** Add `seedNotifications()` in `app/data/mockNotifications.ts` that, if store is empty (or always once at module load), pushes a small set of notifications per userId using existing constants (user-applicant, user-tl, user-inspector, user-admin).
- **Per role:**
  - **Applicant (user-applicant):** e.g. “Application APP-001 status changed to Under Review”; “Application APP-003 (Hope Medical Center) has been approved”; optionally one “returned” with remark. Use applicationIds APP-001, APP-003, APP-008.
  - **Team Leader (user-tl):** e.g. “Inspection submitted for application APP-006 (Lebu Specialty Center). Result: Inspection Submitted.” Use APP-006 or similar.
  - **Inspector (user-inspector):** e.g. “Application APP-002 (Mercy General Clinic) has been assigned to you for inspection.” Use APP-002.
  - **Admin (user-admin):** Mix of 1–2 (e.g. same as applicant or “Application APP-001 status changed to Submitted”) so Admin sees the bell has content.
- **When to run:** Call `seedNotifications()` once when the notifications module is loaded (e.g. at bottom of mockNotifications.ts), or from a single place at app init (e.g. main.tsx or AuthProvider useEffect). Use a guard (e.g. if store size is 0 or a “seeded” flag) so we don’t duplicate on hot reload.
- **Implementation detail:** Either push via existing `addNotification(userId, { applicationId, type, message })` with fixed `createdAt` in the past, or add an internal `seedNotification(notification)` that pushes directly to store without triggering listeners until after all seeds are in; then notifyListeners() once. Prefer addNotification for consistency; use slightly older createdAt (e.g. 1 hour ago) by not relying on “now” if we need to—addNotification always sets createdAt to now, so seeded ones will sort at top unless we add a way to set createdAt for seeds. Simplest: just call addNotification for each seed; order will be by insertion. Optionally add a `seedNotificationsIfEmpty()` that checks store size and only runs once.

## Active Decisions / Considerations

- **Router:** TanStack Router. RootLayout does auth gate and layout branching (login vs AppLayout). Apply has optional $id; inspection has list + $id; team-leader and users are single routes.
- **Mock persistence:** In-memory applications + facilities + auth (sessionStorage). Assign/inspection/approve/return mutate store; queries invalidated.
- **Edit flow:** Single wizard for create and edit; id from route; search param for license type pre-select.
- **Route protection:** UsersPage, TeamLeaderPage, InspectionListPage, InspectionDetailPage redirect to / when role not allowed. Menu hides links by role.
