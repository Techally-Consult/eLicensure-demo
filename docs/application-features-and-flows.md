# eLicensure Demo — Application Features and Flows

This document describes the features and user flows of the eLicensure facility licensing demo app.

---

## 1. Overview

The app is a **static web prototype** for end-to-end facility licensing. It supports:

- **New** facility license
- **Renewal** of an existing license
- **Additional service** (add a service to an existing facility)

Users log in by selecting a role (mock auth). Screens and data are **role-based**: applicants see their own applications; inspectors see applications assigned to them; team leaders and admins see all applications.

---

## 2. Roles and Access

| Role | Description | Applications visible | Can create application | Can assign inspector | Can perform inspection | Can approve/return | Users page |
|------|-------------|----------------------|-------------------------|-----------------------|-------------------------|--------------------|------------|
| **Applicant** | Submits facility license applications | Own only | Yes | No | No | No | No |
| **Inspector** | Performs site inspections | Assigned to me only | No | No | Yes | No | No |
| **Team Leader** | Assigns inspectors and reviews inspections | All | No | Yes | No | Yes (approve or return) | No |
| **Admin** | Full access | All | Yes | — | — | — | Yes |

---

## 3. Routes and Navigation

| Route | Purpose | Who can access |
|-------|---------|----------------|
| `/login` | Mock login (select role) | Unauthenticated |
| `/` | Dashboard | All authenticated |
| `/applications` | Application list | All (filtered by role) |
| `/applications/$id` | Application detail | All (if in their list) |
| `/apply` | New application wizard | Applicant, Admin |
| `/apply/$id` | Edit application wizard | Applicant, Admin (own apps) |
| `/team-leader` | Assign inspector / Review inspection | Team Leader, Admin |
| `/inspection` | My inspections list | Inspector, Admin |
| `/inspection/$id` | Inspection detail (submit result) | Inspector, Admin |
| `/users` | User list | Admin only |

**Sidebar (role-based):**

- **Dashboard** — all roles
- **Applications → List** — all roles
- **Applications → New, Renewal, Variation, Additional service** — Applicant, Admin only
- **Inspection** — Team Leader (→ `/team-leader`), Inspector (→ `/inspection`)
- **Users** — Admin only

---

## 4. Features by Area

### 4.1 Login

- User selects one of four roles and clicks **Log in** (no password).
- Session is stored in the browser; unauthenticated users are redirected to `/login`.
- After login, user is redirected to the **Dashboard** (`/`).

### 4.2 Dashboard (`/`)

Content depends on **role**:

- **Subtitle:** Short description (e.g. “Overview of your facility license applications” for Applicant, “Applications assigned to you for inspection” for Inspector).
- **Summary cards (top row):**
  - **Applicant, Team Leader, Admin:** Applications in progress (Draft + Under review), Submitted, Approved.
  - **Inspector:** Assigned, Under inspection, Inspection done (Submitted + Rejected).
- **Charts:** Applications by status; Applications over time (same for all roles; data is already filtered).
- **Primary action:**
  - **Applicant / Admin:** “Start New Application” → `/apply`.
  - **Inspector:** “View my inspections” → `/inspection`.
  - **Team Leader:** “Assign inspections” → `/team-leader`.
- **Recent applications:** First 8 from the same filtered list; each row has facility name, ID, status badge, and “View” link to detail.

### 4.3 Application List (`/applications`)

- **Applicant:** Only applications where they are the applicant (`applicantUserId` = current user).
- **Inspector:** Only applications where they are assigned (`assignedTo` = current user).
- **Team Leader / Admin:** All applications.

Each row shows key info and status; **View** opens Application detail (`/applications/$id`).

### 4.4 Application Detail (`/applications/$id`)

- **Tabs:** Summary, Form (read-only view of full form), Timeline.
- **Edit:** Button to open the application in the wizard (`/apply/$id`) for editing (Applicant/Admin for own apps).
- **Status:** Dropdown to change status (demo allows any transition); change is saved and a new timeline entry is added.
- **Timeline:** Chronological list of status and key events (Created, Submitted, Assigned, Under Inspection, Inspection Submitted/Rejected, Approved, etc.), with optional remark.

### 4.5 Application Wizard (`/apply`, `/apply/$id`)

- **New application (New license):** `/apply` — full wizard; step 0 = License type (NEW, RENEWAL, ADDITIONAL_SERVICE).
- **Renewal:** `/apply?type=renewal` — first shows a **list of the applicant’s approved applications**. User selects one → **read-only detail** of that application + **“Request renewal”** button. On “Request renewal”, a **new** RENEWAL application is created (copied from the selected one, with `sourceApplicationId` set) and the user is redirected to `/apply/$newId` to complete type-specific (renewal) and submit.
- **Variation:** `/apply?type=variation` — first shows a **list of the applicant’s applications**. User selects one → **navigate to `/apply/$id`** (full edit: all fields editable).
- **Additional service:** `/apply?type=additional` — first shows a **list of the applicant’s applications**. User selects one → **navigate to `/apply/$id?mode=additionalService`**. The wizard shows all steps but **only** Services & capacity, Staff rows, and Type-specific (additional) are **editable**; Applicant, Facility, Infrastructure, and Staffing head are read-only. Submit updates the same application.
- **Edit (direct):** `/apply/$id` loads existing application and pre-fills the wizard; all fields editable (unless `?mode=additionalService`).
- **Steps:** License type → Applicant → Facility → Services & capacity → Staffing → Infrastructure → Type-specific → Review & submit.
- **Create:** On submit, the application is stored with `applicantUserId` = current user. RENEWAL applications may have `sourceApplicationId` pointing to the application being renewed.
- **Edit:** Save updates the existing application and timeline as needed.

### 4.6 Team Leader (`/team-leader`)

Two tabs:

1. **Assign to inspector**
   - List of applications in **Submitted** status.
   - For each, select an inspector and assign; status becomes **Assigned** and the inspector receives a notification.
2. **Review inspection**
   - List of applications in **Inspection Submitted** or **Inspection Rejected**.
   - For each: **Approve license** (status → Approved) or **Return to applicant** (with a remark). Applicant is notified.

### 4.7 Inspector (`/inspection`, `/inspection/$id`)

- **List (`/inspection`):** Applications where `assignedTo` = current user (any status: Assigned, Under Inspection, Inspection Submitted, Inspection Rejected).
- **Detail (`/inspection/$id`):**
  - Application summary.
  - If status is **Assigned**, opening the detail can set it to **Under Inspection**.
  - **Submit inspection:** Choose result (Inspection Submitted / Inspection Rejected), optional remark; submit updates the application and notifies the team leader and applicant.

### 4.8 Users (`/users`)

- **Admin only.** Lists the four mock users (name, email, role). Other roles are redirected away.

### 4.9 Notifications

- **Bell icon** in the header (when logged in): unread count and dropdown of notifications.
- **Types:** status change (applicant), assigned (inspector), inspection submitted (team leader + applicant), approved / returned (applicant).
- Clicking a notification marks it read and can link to the related application. “Mark all read” is available.

---

## 5. Application Workflow (Status Flow)

### 5.1 Statuses

| Status | Meaning |
|--------|---------|
| **Draft** | Application saved but not submitted. |
| **Submitted** | Applicant has submitted; awaiting assignment by team leader. |
| **Assigned** | Team leader has assigned an inspector. |
| **Under Inspection** | Inspector has started (e.g. opened) the inspection. |
| **Inspection Submitted** | Inspector submitted a positive inspection result. |
| **Inspection Rejected** | Inspector submitted a negative inspection result. |
| **Under Review** | Under review by team leader (e.g. after inspection). |
| **Approved** | License approved. |
| **Rejected** | Application or license rejected. |

### 5.2 Flow (end-to-end)

```text
Applicant                    Team Leader                 Inspector
    |                             |                           |
    |  Create & submit            |                           |
    |  (Draft → Submitted)        |                           |
    |---------------------------->|                           |
    |                             |  Assign inspector          |
    |                             |  (Submitted → Assigned)   |
    |                             |-------------------------->|
    |                             |                           |  Open inspection
    |                             |                           |  (Assigned → Under Inspection)
    |                             |                           |
    |                             |  Submit inspection        |
    |                             |  (→ Inspection Submitted  |
    |                             |   or Inspection Rejected) |
    |                             |<--------------------------|
    |                             |                           |
    |                             |  Approve or Return        |
    |  (Notify: approved/return)  |  to applicant + remark    |
    |<----------------------------|                           |
    |                             |                           |
```

- **Applicant:** Creates application (Draft), submits (Submitted). Later may be notified of approval or return with remark.
- **Team Leader:** Sees Submitted applications → assigns inspector (Assigned). Later sees Inspection Submitted/Rejected → Approves license or Returns to applicant with remark.
- **Inspector:** Sees Assigned applications → opens inspection (Under Inspection) → submits result (Inspection Submitted or Inspection Rejected) with optional remark.

On the **Application detail** page, the status dropdown allows any status transition for demo purposes; the main intended flow is the one above.

---

## 6. Data at a Glance

- **Applications** are stored in memory; each has an `applicantUserId` (owner) and optionally `assignedTo` (inspector). List and dashboard use these to filter by role.
- **Seed data:** 12 sample applications (all with `applicantUserId`; a subset have `assignedTo` for the Inspector demo).
- **Facilities:** Small in-memory list used for renewal/additional-service facility selection in the wizard.
- **Auth:** Current user (and role) stored in session storage; no real backend.

---

## 7. Out of Scope (Current Prototype)

- Real backend or database persistence.
- Real file upload (e.g. floor plan is placeholder).
- Real authentication (login is role selection only).
- Optional future: seed notifications per role so each user sees demo notifications on first load; toasts on submit/assign/inspection.
