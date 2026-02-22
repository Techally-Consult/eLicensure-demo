# Plan: Renewal, Variation, and Additional Service — Application Selection and Type-Specific Flows

## Mode: PLAN

**Goal:** For **Renewal**, **Variation**, and **Additional service**, the apply flow should start with a **list of applications** to choose from. After the user selects an application, the flow differs by type:

- **Renewal:** Show application detail and allow the applicant to **request renewal** of the license.
- **Variation:** Show all application details in **form format** and allow the applicant to **edit any fields** (variation = edit).
- **Additional service:** Show all application details in **form format** but **only enable editing** of fields related to additional service; rest read-only.

---

## 1. Current State

- **Nav:** New, Renewal, Variation, Additional service all go to `/apply` (New) or `/apply?type=renewal|variation|additional`. No `id` on first load.
- **Wizard:** Single multi-step flow (License type → Applicant → Facility → … → Review & submit). For `type=renewal` we set `licenseType: RENEWAL`; for `type=variation` or `type=additional` we set `licenseType: ADDITIONAL_SERVICE`. User then goes through the same steps (e.g. picks facility for RENEWAL/ADDITIONAL_SERVICE).
- **Types:** `LicenseType` is `NEW | RENEWAL | ADDITIONAL_SERVICE`. There is no separate VARIATION type; “Variation” in the nav is an **entry flow** that leads to editing an existing application (same data, all fields editable).
- **Edit:** `/apply/$id` loads the application and pre-fills the wizard; submit calls `updateApplication(id, payload)`.

---

## 2. Target Behavior (Summary)

| Entry (nav)     | First screen           | After selecting application |
|-----------------|------------------------|-----------------------------|
| **Renewal**     | List of applications   | Application **detail** (read-only) + **“Request renewal”** action |
| **Variation**   | List of applications   | **Full form** (all fields editable) — same as edit |
| **Additional**  | List of applications   | **Full form** with **only additional-service-related fields editable**; rest read-only |

---

## 3. Application List (Choose From)

- **When:** User opens `/apply?type=renewal`, `/apply?type=variation`, or `/apply?type=additional` (no `id`).
- **What:** Show a single screen: “Select an application to [renew / vary / add service to]” and a **list of applications** the applicant can choose from.
- **Data:** Use existing `useApplications()` so the list is the **applicant’s own** applications (already filtered by role).
- **Filtering (optional, can be phase 2):**
  - **Renewal:** Optionally restrict to applications that are **Approved** (or have a status that implies an active license), so only “renewable” licenses appear. If not specified, show all applicant applications and let product decide later.
  - **Variation / Additional:** Show all applicant applications (or restrict to Approved/Draft/etc. per product rules).
- **Selection:** User clicks an application (row or “Select”).
  - **Renewal** → go to “renewal detail” view (see below).
  - **Variation** → navigate to **`/apply/$id`** (existing edit flow; no extra search param required).
  - **Additional** → navigate to **`/apply/$id?mode=additionalService`** (form with partial edit, see below).

---

## 4. Renewal Flow (After Selection)

- **Screen:** Show the **selected application’s detail** (read-only). Reuse the same content as Application detail “Summary” (and optionally Timeline): facility name, applicant, services, status, type-specific renewal info if any, etc. No need for a full separate page component if we can reuse summary blocks or a shared `<ApplicationSummary application={…} />` component.
- **Action:** A single primary button: **“Request renewal”**.
- **On “Request renewal”:**
  - **Create a new application** with:
    - `licenseType: "RENEWAL"`
    - `applicantUserId`: current user
    - `facilityId`, `facility`, `applicant`, `services`, `totalBeds`, `staffingHead`, `staffRows`, `infrastructureDescription` copied from the **selected** application (so the new application is tied to the same facility/applicant).
    - `typeSpecific.renewal`: pre-fill from the selected application’s existing license (e.g. license number, issue/expiry dates, last inspection) if available; otherwise leave editable for the user to complete.
    - Optional: add a field like `sourceApplicationId` or `renewalOfApplicationId` on `Application` to link the new RENEWAL application to the one being renewed (for traceability and reporting).
  - Then either:
    - **A)** Redirect to **`/apply/$newId`** so the user can complete the “Type-specific” (renewal) step and Review & submit (minimal extra steps), or  
    - **B)** Show an inline “Renewal details” form on the same screen (changes, expiry, etc.) and on submit create the new application and redirect to success/detail.
- **Recommendation:** **A** — create new RENEWAL application, redirect to `/apply/$newId` with wizard opened at the relevant step (e.g. step “Type-specific” or “Review & submit”) so the rest of the flow stays in one place and we reuse existing renewal type-specific UI.

---

## 5. Variation Flow (After Selection)

- **Behavior:** Variation is “edit this application.” After the user selects an application from the list, **navigate to `/apply/$id`** (no `mode` param).
- **Implementation:** Reuse the existing **edit** flow: ApplicationWizardPage with `id` from route loads the application and shows the full wizard with **all fields editable**. No new UI; the “list then select” step is the only addition for Variation.

---

## 6. Additional Service Flow (After Selection)

- **Behavior:** After the user selects an application, show the **full application in form layout**, but **only certain fields are editable**; the rest are read-only (or disabled).
- **Editable (additional-service-related):**
  - **Services & capacity:** services list, totalBeds (user can add services and update total beds).
  - **Type-specific (additional):** `typeSpecific.additional` — current services (can stay read-only), new services (name, category, beds, summary), justification, impact.
  - **Staffing (optional):** `staffRows` — if adding a new service often requires new staff, allow adding/editing staff rows; otherwise leave read-only. Plan: **allow editing** so applicant can add staff for the new service.
- **Read-only (or disabled):** Applicant, Facility, Infrastructure description, Staffing head (single head). License type is fixed (ADDITIONAL_SERVICE).
- **Implementation approach:**
  - When opening the wizard with `id` and **`?mode=additionalService`** (or `search.mode === 'additionalService'`):
    - Load the application and pre-fill wizard state (same as edit).
    - Render the **same step structure** (Applicant, Facility, Services, Staffing, Infrastructure, Type-specific, Review) but:
      - **Applicant, Facility, Infrastructure, Staffing head:** render as read-only (values shown, inputs disabled or replaced by text).
      - **Services & capacity, Staff rows, Type-specific (additional):** editable.
    - On submit: call **`updateApplication(id, payload)`** with only the editable fields (or full payload; server/mock can ignore non-editable fields). So we are **updating the same application** with new services and additional-service-specific data, not creating a new application.
- **Note:** Today “Additional service” in the nav sets `licenseType: ADDITIONAL_SERVICE` and uses the same wizard as new applications. After this change, “Additional service” always starts from **list → select existing application** → then form with partial edit. So the “new ADDITIONAL_SERVICE application from scratch” path (no existing facility) could be removed or kept only if product wants both “new” and “add service to existing”; the plan assumes we only support “add service to existing” for Additional service.

---

## 7. Routing and URL Shape

- **`/apply`** — New application (no change; step 0 = License type).
- **`/apply?type=renewal`** — When no `id`: show **application list** for renewal. After selection: show renewal detail + “Request renewal” (or redirect to new RENEWAL app).
- **`/apply?type=variation`** — When no `id`: show **application list** for variation. After selection: **navigate to `/apply/$id`** (edit).
- **`/apply?type=additional`** — When no `id`: show **application list** for additional service. After selection: **navigate to `/apply/$id?mode=additionalService`**.
- **`/apply/$id`** — Edit (existing). If `mode=additionalService`, render form with only additional-service-related fields editable (see above).
- **`/apply/$id`** (from “Request renewal”) — New RENEWAL application just created; user completes type-specific and review steps.

No new routes required; only query params `type` and `mode` and conditional UI in the existing Apply wizard/list.

---

## 8. Implementation Steps (Order)

1. **Application list screen (select one)**  
   - In `ApplicationWizardPage` (or a small wrapper): when `!id` and `search.type` is `renewal` | `variation` | `additional`, render **only** an “Select application” view (list from `useApplications()`, each row with “Select” or click to choose).  
   - On select: set state (e.g. `selectedApplicationId`) and for **Variation** navigate to `/apply/$id`; for **Additional** navigate to `/apply/$id?mode=additionalService`; for **Renewal** show the next view (detail + Request renewal).

2. **Renewal: detail + “Request renewal”**  
   - When `!id`, `type=renewal`, and `selectedApplicationId` is set: load application with `useApplication(selectedApplicationId)`, render **read-only detail** (reuse Summary content from ApplicationDetailPage or extract a shared `<ApplicationSummary />`).  
   - Button “Request renewal”: create new application via `submitApplication({ licenseType: 'RENEWAL', facilityId, facility, applicant, ..., typeSpecific: { renewal: { ... } }, applicantUserId })`, then redirect to `/apply/$newId` (and optionally skip to step “Type-specific” or “Review & submit” so user can confirm and submit).  
   - Optional: add `sourceApplicationId` (or `renewalOfApplicationId`) to Application type and set it when creating the RENEWAL application.

3. **Variation**  
   - No extra implementation beyond list + navigate to `/apply/$id` (existing edit flow).

4. **Additional service: partial edit in wizard**  
   - When `id` is set and `search.mode === 'additionalService'`: in `ApplicationWizardPage`, after loading the application, render the same steps but with **read-only** for Applicant, Facility, Infrastructure, Staffing head; **editable** for Services & capacity, Staff rows, Type-specific (additional).  
   - Use a single “edit mode” flag (e.g. `isAdditionalServiceMode`) to toggle disabled/read-only on the right sections.  
   - Submit: `updateApplication(id, payload)` so the same application is updated with the new services and additional-service data.

5. **Optional: filter list for Renewal**  
   - When `type=renewal`, filter the list to `applications.filter(a => a.status === 'Approved')` (or product-defined rule) so only renewable licenses appear.

6. **Nav and docs**  
   - Ensure nav links (Renewal, Variation, Additional service) still point to `/apply?type=renewal|variation|additional`. Update `docs/application-features-and-flows.md` (or equivalent) to describe the new flows.

---

## 9. Files to Touch (Summary)

- **`app/pages/ApplicationWizardPage.tsx`**  
  - Branch on `!id` + `search.type` (renewal/variation/additional) to show application list.  
  - Branch on `type=renewal` + `selectedApplicationId` to show detail + “Request renewal”.  
  - Branch on `id` + `search.mode === 'additionalService'` to render form with partial edit (read-only vs editable sections).  
  - “Request renewal” handler: build payload from selected application, call `submitApplication`, redirect to `/apply/$newId`.

- **`app/types/application.ts`** (optional)  
  - Add `sourceApplicationId?: string` or `renewalOfApplicationId?: string` to `Application` if we want to link RENEWAL to the source application.

- **`app/data/mockApi.ts`** (optional)  
  - If we add `sourceApplicationId`, ensure `submitApplication` and store accept it.

- **Shared component (optional but useful)**  
  - Extract **ApplicationSummary** (or reuse ApplicationDetailPage summary block) so Renewal can show read-only detail without duplicating markup.

- **Docs**  
  - Update **`docs/application-features-and-flows.md`** to describe: list → select, then Renewal (detail + request renewal), Variation (edit), Additional (partial edit).

---

## 10. Edge Cases and Decisions

- **New “Additional service” without selecting existing application:** Current plan is “Additional service always starts from list → select.” If product later wants “new additional service” (no existing facility), we can add a separate entry or a “Create new” option on the list screen.
- **Renewal of non-Approved application:** If we don’t filter the list, user could select a Draft/Rejected application; “Request renewal” would still create a new RENEWAL application. Product may want to restrict to Approved only.
- **Variation of Approved application:** Editing an approved application might be a “variation” in real life. Allowing it in the demo is fine; product can add validation or status rules later.

---

**End of plan.** To implement, say **ACT** and proceed with the steps above.
