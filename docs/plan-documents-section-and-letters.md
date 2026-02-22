# Plan: Documents Section, Applicant Uploads, and Generated Letters

## Mode: PLAN

**Goal:**
1. Add a **Documents** section in the application form so applicants can attach relevant documents (mock: add entries with test PDF URLs).
2. **Inspectors** can view those documents (read-only) when reviewing an application.
3. On **submit** of an application, generate an **acknowledgement letter** (mock: store a test PDF URL).
4. On **approval** of an application, generate a **license certificate letter** (mock: store a test PDF URL).
5. All document links use **test PDF URLs** for mocking (no real file upload or storage).

---

## 1. Data Model

### 1.1 Document type

Introduce a shared type for a single document reference (no file content, only metadata + URL):

- **`ApplicationDocument`** (e.g. in `app/types/application.ts`):
  - `id: string` — unique per document (e.g. `doc-${applicationId}-${index}` or UUID)
  - `name: string` — display name (e.g. "Floor plan", "Acknowledgement letter")
  - `type: "applicant" | "acknowledgement" | "license_certificate"` — who/what generated it
  - `url: string` — URL to the document (for mock: test PDF URL)
  - `uploadedAt: string` — ISO date
  - `uploadedBy?: string` — optional user id (for applicant uploads; omit for system-generated)

### 1.2 Application

- Add to **`Application`** (and thus to payload where applicable):
  - **`documents?: ApplicationDocument[]`**
- **ApplicationPayload:** Ensure it can carry `documents` (Omit already allows it if we add to Application).

### 1.3 Test PDF URLs

- Define constants (e.g. in `app/data/mockApi.ts` or a small `app/data/mockDocuments.ts`):
  - **Acknowledgement letter:** e.g. `https://www.w3.org/WAI/WCAG21/Techniques/pdf/example.pdf` or another stable public test PDF.
  - **License certificate:** e.g. a second test PDF URL (can be same or different for demo).
  - **Applicant uploads:** Use one or two fixed test PDF URLs when user "adds" a document (no real upload).

---

## 2. Wizard: Documents Step

- **Where:** Add a new step **"Documents"** in the application wizard (e.g. after **Infrastructure** and before **Type-specific**, or after **Type-specific** and before **Review & submit**). Adjust step indices accordingly (e.g. step 6 = Documents, 7 = Type-specific, 8 = Review).
- **Who:** Shown for **Applicant** (and Admin when creating/editing). In **Additional service** mode (`?mode=additionalService`), Documents can be editable (applicant may add supporting docs) or read-only per product preference; recommend **editable** so they can add documents for the new service.
- **UI:**
  - List of **applicant** documents (from wizard state or application when editing).
  - Each row: **name**, **type** (optional label, e.g. "Supporting document"), **View** link (opens `url` in new tab).
  - **Add document** (mock): Button or form that adds a row with:
    - **Name** (required) — user-entered (e.g. "Floor plan", "Insurance certificate").
    - **URL** in mock can be **fixed**: on "Add", push `{ id, name, type: "applicant", url: MOCK_APPLICANT_PDF_URL, uploadedAt: now }` so no file picker; optionally allow pasting a URL for testing.
  - Remove or reorder: optional (minimal: allow remove so applicant can correct the list).
- **State:** Extend **WizardState** with `documents: ApplicationDocument[]` (or a minimal shape: `{ id, name, type: "applicant", url, uploadedAt }[]`). On load from application, pre-fill from `application.documents` (filter or map to applicant-only for editing; or show all and only allow adding new applicant docs). On submit (create/update), send `documents` in the payload so they are stored on the application.

---

## 3. Submit: Acknowledgement Letter

- **When:** Application is **submitted** (status becomes **Submitted**). Two paths:
  - **Create:** `submitApplication()` is called with status **Submitted**. After creating the application, append to `documents` one entry: `{ type: "acknowledgement", name: "Acknowledgement letter", url: MOCK_ACKNOWLEDGEMENT_PDF_URL, uploadedAt: lastUpdated }` (and an `id`).
  - **Update:** If applicant saves with status **Submitted** via `updateApplication()` (e.g. from Draft to Submitted), we need to ensure acknowledgement is added once. Option: in `updateApplication` when new status is Submitted and the application did not previously have an acknowledgement document, append it. Or a small helper `ensureAcknowledgementLetter(application)` called from both submit and update paths when status is Submitted.
- **Idempotency:** Only add acknowledgement if there isn’t already one (e.g. no document with `type === "acknowledgement"`).

---

## 4. Approval: License Certificate

- **When:** Application is **approved** (status becomes **Approved**). Single path: **`approveLicense(id)`**.
- **Where:** In `approveLicense()` in `app/data/mockApi.ts`, after updating status (and sending notification), update the application to append a document: `{ type: "license_certificate", name: "License certificate", url: MOCK_LICENSE_CERTIFICATE_PDF_URL, uploadedAt: now }` with an `id`. Use `updateApplication(id, { documents: [...existing, newDoc] })` or a dedicated helper that appends a document.
- **Idempotency:** Only add if no document with `type === "license_certificate"` exists.

---

## 5. Application Detail Page: Documents Section

- **Where:** Application detail page (`/applications/$id`) — add a **Documents** section (e.g. a new tab, or a card below Summary/Form/Timeline).
- **Content:** List all `application.documents` (applicant + acknowledgement + license certificate if present). Each row: **name**, **type** (or label), **View** link (open `url` in new tab). Read-only for all roles.
- **Applicant:** Optionally allow **Add document** (same mock as wizard: name + fixed test URL) and call `updateApplication(id, { documents: [...app.documents, newDoc] })` so documents can be added after submission. If product prefers documents only at submission time, omit "Add" on detail and keep it wizard-only.

---

## 6. Inspection Detail Page: Documents Section

- **Where:** Inspection detail page (`/inspection/$id`) — used by **Inspector** (and Team Leader/Admin if they open inspection view).
- **Content:** Same as application detail: **Documents** section listing all `application.documents` (applicant uploads + acknowledgement; license certificate if already approved). **Read-only** — no add/remove. Each item: name, type/label, **View** link to open PDF in new tab.
- **Purpose:** Inspectors can review uploaded documents and generated acknowledgement (and license if approved) before or after submitting their inspection.

---

## 7. Mock Implementation Details

### 7.1 Test PDF URLs

- Use public, stable URLs that serve a PDF (e.g. W3C sample, or PDFObject sample). Example constants:
  - `MOCK_ACKNOWLEDGEMENT_PDF_URL = "https://www.w3.org/WAI/WCAG21/Techniques/pdf/example.pdf"`
  - `MOCK_LICENSE_CERTIFICATE_PDF_URL = "https://www.w3.org/WAI/WAI20/test-assets/PDFs/table.pdf"` (or same as above if multiple URLs are not needed)
  - `MOCK_APPLICANT_PDF_URL = "https://www.w3.org/WAI/WCAG21/Techniques/pdf/example.pdf"` (for any applicant-uploaded document)
- All links open in a new tab (`target="_blank"` / `rel="noopener noreferrer"`).

### 7.2 No real upload

- No file input, no FormData, no backend storage. "Add document" only adds a record with `name` (and optionally a pasted URL for testing); `url` is set to a constant or a simple test URL. If we allow pasted URL in mock, validate it’s a non-empty string and use it; otherwise use `MOCK_APPLICANT_PDF_URL`.

### 7.3 Seed data

- Optionally add a few `documents` to 1–2 seed applications so the list and inspector view are populated from first load (e.g. APP-001 has 1–2 applicant documents; APP-003 has acknowledgement + maybe license certificate). Not required for MVP.

---

## 8. Implementation Order

1. **Types:** Add `ApplicationDocument` and `documents?: ApplicationDocument[]` to `Application` (and ensure payload allows it).
2. **Constants:** Add test PDF URL constants; helper to generate `id` for new documents (e.g. `doc-${Date.now()}-${i}` or nanoid if available).
3. **Mock API:**
   - In `submitApplication`, when status is Submitted, append acknowledgement document to the created application (and ensure created app has `documents` array).
   - In `approveLicense`, after status update, append license certificate document (read application, merge documents, updateApplication).
   - Optional: `addApplicationDocument(id, doc)` that loads app, appends one document, and calls updateApplication; use from wizard/detail if desired.
4. **Wizard:** Add step Documents (extend STEPS, WizardState, step validation, and payload building). UI: list + "Add document" (name + fixed or pasted URL), View link per row.
5. **Application detail:** Add Documents section (list + View links). Optionally "Add document" for applicant.
6. **Inspection detail:** Add Documents section (read-only list + View links).
7. **Seed (optional):** Add `documents` to a couple of seed applications for demo.

---

## 9. Files to Touch (Summary)

- **`app/types/application.ts`** — Add `ApplicationDocument`, add `documents?: ApplicationDocument[]` to `Application`.
- **`app/data/mockApi.ts`** — Test PDF constants; in `submitApplication` add acknowledgement when status Submitted; in `approveLicense` append license certificate document; ensure `updateApplication` accepts `documents` and merges/overwrites as intended (replace full array is fine).
- **`app/pages/ApplicationWizardPage.tsx`** — New step Documents; extend WizardState and payload; list + Add document (mock) + View links.
- **`app/pages/ApplicationDetailPage.tsx`** — Documents section (list + View); optionally Add for applicant.
- **`app/pages/InspectionDetailPage.tsx`** — Documents section (read-only list + View links).
- **Seed data in mockApi.ts (optional):** Add `documents` array to 1–2 applications.

---

## 10. Edge Cases

- **Draft with documents:** Applicant can add documents in wizard and save as Draft; documents are stored. On submit (Draft → Submitted), acknowledgement is added.
- **Edit after submit:** If applicant edits an approved application (e.g. variation), they see existing documents; they can add more applicant documents if we allow it on detail. We do not remove or regenerate acknowledgement/license certificate.
- **Approval without going through team leader UI:** If status is set to Approved via detail page status dropdown, licence certificate would not be auto-added unless we also hook into `updateApplicationStatus` when new status is Approved. Plan: only add license certificate in `approveLicense()`; if product wants it also when status is set to Approved via dropdown, we can add the same logic in `updateApplicationStatus` for status === "Approved".

---

**End of plan.** To implement, say **ACT** and proceed with the steps above.
