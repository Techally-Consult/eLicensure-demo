# Progress

## What Works

- **Stack:** TanStack Router, TanStack Query, React 19, Tailwind 4, Vite 7, TypeScript, shadcn UI, Recharts.
- **Auth:** Mock login at `/login` (role select); 4 users (Admin, Applicant, Team Leader, Inspector); AuthContext + sessionStorage; RootLayout auth gate; AppLayout shows user name, role, Log out.
- **Routing:** `/login`, `/`, `/applications`, `/applications/$id`, `/apply`, `/apply/$id`, `/team-leader`, `/inspection`, `/inspection/$id`, `/users`. Role-based nav; route protection (Users, Team Leader, Inspection pages).
- **Data:** Application type with full-form fields + applicantUserId, sourceApplicationId (RENEWAL), assignedTo, inspection, remark; statuses including Assigned, Under Inspection, Inspection Submitted/Rejected. Mock API: listApplications(options) for role-filtered list, submit (with applicantUserId, sourceApplicationId), update, updateStatus, assign, setUnderInspection, submitInspection, approveLicense, returnToApplicant. 12 seed applications (all with applicantUserId; APP-002, APP-006, APP-011 with assignedTo for Inspector), 2 facilities, 4 mock users.
- **Notifications:** Types in `app/types/notification.ts`. Store and API in `app/data/mockNotifications.ts` (getNotifications, addNotification, markRead, markAllRead, subscribe). Notifications emitted from mockApi on status change (→ applicant), assign (→ inspector), inspection submit (→ team leader + applicant), approve/return (→ applicant). `useNotifications(userId)` hook; `NotificationsDropdown` in AppLayout header (bell + unread count, dropdown list, mark as read, link to application).
- **Dashboard:** Role-specific subtitle and summary cards (Applicant/TL/Admin: in progress, submitted, approved; Inspector: assigned, under inspection, inspection done); same charts and recent list; CTA by role (Applicant/Admin: Start New Application; Inspector: View my inspections; Team Leader: Assign inspections).
- **Applications list & detail:** List filtered by role (Applicant: own; Inspector: assigned; TL/Admin: all), StatusBadge, View → detail. Detail: Edit → `/apply/$id`, status Select (all workflow statuses), Summary/Form/Timeline tabs.
- **Wizard:** New application at `/apply`; edit at `/apply/$id`. For Renewal/Variation/Additional: `/apply?type=renewal|variation|additional` shows application list first (Renewal: Approved only). Select → Renewal: detail + “Request renewal” (new RENEWAL app with sourceApplicationId, redirect to /apply/$newId); Variation: full edit at /apply/$id; Additional: partial edit at /apply/$id?mode=additionalService (only Services, Staff rows, Type-specific additional editable). On create, passes applicantUserId from useAuth(); full payload save.
- **Team Leader:** `/team-leader` — Assign (list Submitted, assign inspector), Review (list Inspection Submitted/Rejected, Approve or Return to applicant with remark).
- **Inspector:** `/inspection` list (my assigned); `/inspection/$id` (summary + submit inspection); opening detail sets Under Inspection when Assigned.
- **Users:** `/users` lists 4 mock users; Admin only.
- **Scripts:** `pnpm run dev`, `pnpm run build`, `pnpm run typecheck` succeed.

## What’s Left to Build (Optional)

- [ ] **Seed notifications for all roles:** Pre-populate 2–4 notifications per user (Applicant, Team Leader, Inspector, Admin) so the bell dropdown shows demo content on first load. Plan in activeContext.md.
- [ ] **Toast:** Sonner for submit/save and assign/inspection actions.
- [ ] **Polish:** Empty states, a11y, more shadcn in wizard.
- [ ] **VARIATION license type:** Add to wizard if product requires it.

## Current Status

- **Phase:** Core workflow + in-app notifications complete. Optional: seed notifications per role, toast, polish, VARIATION type.

## Next Step (Plan): Seeding notification data for all roles

**Goal:** Each of the 4 users sees demo notifications when they log in (no empty bell).

**Approach:**

1. **Add `seedNotifications()` in `app/data/mockNotifications.ts`**
   - Guard: run only if store is empty (e.g. `store.size === 0`) to avoid duplicates on hot reload.
   - For each userId (`user-applicant`, `user-tl`, `user-inspector`, `user-admin`), call `addNotification(userId, { applicationId, type, message })` 2–4 times with varied types and messages, using existing seed application ids (APP-001, APP-002, APP-003, APP-006, APP-008, etc.).

2. **Per-role seed content (examples)**
   - **Applicant:** status_change (APP-001 → Under Review), approved (APP-003, Hope Medical Center), returned (APP-008 with short remark).
   - **Team Leader:** inspection_submitted (APP-006, Lebu Specialty Center, Result: Inspection Submitted).
   - **Inspector:** assigned (APP-002, Mercy General Clinic).
   - **Admin:** e.g. status_change (APP-001), approved (APP-003) so Admin sees the same kind of content.

3. **When to run**
   - Call `seedNotifications()` at the end of `mockNotifications.ts` when the module loads, inside the guard so it runs only once per session. Alternatively call from `main.tsx` or `AuthProvider` in a `useEffect` once; guard by “already seeded” flag or empty store.

4. **Implementation detail**
   - Use existing `addNotification` for each seed so order and format stay consistent. No need to set custom `createdAt` for demo; “now” is fine. If we want oldest-first in dropdown we could push in reverse order or rely on existing sort (newest first).

**Result:** Applicant, Team Leader, Inspector, and Admin each see a few relevant notifications in the bell dropdown immediately after login.

## Known Issues

- None.
