# System Patterns

## Route Tree (Implemented)

- `/login` → Login page (role select, mock login); no AppLayout.
- `/` → Dashboard
- `/applications` → Application list; `/applications/$id` → Application detail
- `/apply` → New application or (if `?type=renewal|variation|additional`) application list → select → type-specific flow; `/apply/$id` → Edit; `/apply/$id?mode=additionalService` → Edit with only additional-service fields editable
- `/team-leader` → Team Leader page (assign inspector, review inspection); role-protected
- `/inspection` → Inspection list (my assigned); `/inspection/$id` → Inspection detail (submit); role-protected
- `/users` → Users list (Admin only); role-protected

Root: RootLayout (auth gate; if /login render Outlet else render AppLayout with Outlet). AppLayout receives children from RootLayout for main content.

## Layout Architecture

- **RootLayout:** `app/layouts/RootLayout.tsx`. If !user && !isLogin → redirect /login. If isLogin → <Outlet /> (LoginPage). Else → <AppLayout><Outlet /></AppLayout>.
- **AppLayout:** Top navbar (eLicensure, Demo badge, **NotificationsDropdown** (bell + unread count, dropdown list, mark read), user name + role, Log out, avatar); side nav role-based. Main: `{children ?? <Outlet />}`.
- **NavLink:** `Link` from `@tanstack/react-router` with `activeProps`.

## Data & State

- **Auth (mock):** `app/data/mockAuth.ts`: MOCK_USERS (4), getStoredUser/setStoredUser, getUsersByRole. `app/contexts/AuthContext.tsx`: current user, login(role), logout; sessionStorage.
- **Notifications (mock):** `app/data/mockNotifications.ts`: in-memory store Map<userId, Notification[]>; getNotifications(userId), addNotification(userId, payload), markNotificationRead(userId, id), markAllNotificationsRead(userId), subscribeNotifications(listener). Emitted from mockApi on updateApplicationStatus (→ applicant), assignApplication (→ inspector), submitInspection (→ team leader + applicant), approveLicense/returnToApplicant (→ applicant). Optional: seedNotifications() for demo data per role.
- **Mock API (async):** `app/data/mockApi.ts`. List/get: listApplications(options?: { role, userId }) — filters by Applicant (applicantUserId), Inspector (assignedTo), Team Leader/Admin (all); getApplication(id), listFacilities. Mutations: submitApplication (accepts applicantUserId), updateApplication, updateApplicationStatus (+ notifies applicant), assignApplication (+ notifies inspector), setUnderInspection, submitInspection (+ notifies team leader + applicant), approveLicense (+ applicant), returnToApplicant (+ applicant). In-memory applications store (12 seed with applicantUserId; APP-002, APP-006, APP-011 with assignedTo for Inspector); timeline appended on status/assign/inspection.
- **Query hooks:** useApplications() uses useAuth(), calls listApplications({ role: user?.role, userId: user?.id }), query key ["applications", user?.role, user?.id]; useApplication(id), useFacilities(). Invalidate after submit/update/status/assign/inspection/approve/return.
- **Wizard state (local):** ApplicationWizardPage: full WizardState; useAuth(), useApplications() for list mode. When !id and search.type in renewal|variation|additional: show application list (Renewal = Approved only); on select, Renewal → detail + “Request renewal” (submitApplication new RENEWAL with sourceApplicationId, then navigate to /apply/$newId), Variation → navigate to /apply/$id, Additional → navigate to /apply/$id?mode=additionalService. When id and search.mode=additionalService: isAdditionalServiceMode true — Applicant, Facility, Infrastructure, Staffing head read-only; Services, Staff rows, Type-specific (additional) editable. When route has id init from applicationToWizardState once. Submit: updateApplication(id) or submitApplication({ ...payload, status: 'Submitted', applicantUserId: user?.id }).

## Mock Data Shapes

- **User:** id, email, name, role (UserRole).
- **Application:** id, licenseType, facilityName, status, lastUpdated, timeline; optional applicant, facility, facilityId, services, totalBeds, staffingHead, staffRows, infrastructureDescription, typeSpecific, **applicantUserId**, **sourceApplicationId** (for RENEWAL), **assignedTo**, **inspection** (InspectionResult), **remark**. Status flow: Draft → Submitted → Assigned → Under Inspection → Inspection Submitted/Rejected → Approved or Rejected.
- **InspectionResult:** result (Submitted|Rejected), remark?, submittedAt, submittedBy.
- **Notification:** id, userId, applicationId?, type (status_change | assigned | inspection_submitted | approved | returned), message, read, createdAt.
- **Facility:** id, mfrId, name, type, licenseNumber, services[].

## Key Components

| Screen / Area | Components |
|---------------|------------|
| Layout | AppShell, NavLink list, NotificationsDropdown (bell + list in header) |
| Dashboard | Role-specific subtitle and summary cards (Applicant/TL/Admin: in progress, submitted, approved; Inspector: assigned, under inspection, inspection done); charts; role-specific CTA (Applicant/Admin: Start New Application; Inspector: View my inspections; Team Leader: Assign inspections); recent applications |
| Applications list | ApplicationsTable, StatusBadge, row “View” action |
| Application detail | Edit, Status Select (all workflow statuses), Tabs (Summary / Form / Timeline), Timeline |
| Wizard | List mode (renewal/variation/additional): application list → select; Renewal: detail + Request renewal → new RENEWAL app; Variation: navigate to edit; Additional: navigate to edit with ?mode=additionalService (partial edit). Tabs + Card, RadioGroup (license type), full form; create/edit; additionalService mode: read-only Applicant, Facility, Infrastructure, Staffing head |
| Team Leader | Tabs: Assign (list Submitted, assign inspector), Review (list Inspection Submitted/Rejected, Approve / Return with remark) |
| Inspector | List my assigned; detail: application summary + submit inspection (Submitted/Rejected + remark) |
| Users | List 4 mock users (Admin only) |

## Design Patterns

- **Auth gate:** RootLayout redirects to /login if !user; login page sets user by role and redirects to /.
- **Role-based UI:** AppLayout nav visibility by role (canSeeApplicationsNew, canSeeInspection, canSeeUsers). Team Leader sees Inspection → /team-leader; Inspector sees Inspection → /inspection. Pages /users, /team-leader, /inspection redirect to / when role not allowed. Application list (useApplications) and dashboard content are filtered/varied by role (Applicant: my applications + applicant-focused dashboard; Inspector: assigned apps + inspection-focused cards/CTA; Team Leader/Admin: all apps + overview dashboard).
- **Workflow:** Applicant submits → Team leader assigns inspector → status Assigned then Under Inspection → Inspector submits inspection → Team leader approves or returns with remark. Status change and assign append to timeline.
- **Wizard:** One component for create/edit; id from route; when !id and type=renewal|variation|additional show list then type-specific flow (renewal detail + new RENEWAL, variation → edit, additional → edit with mode=additionalService); full payload on submit; RENEWAL applications may have sourceApplicationId.
