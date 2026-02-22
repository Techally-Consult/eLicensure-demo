# Plan: Document Types, Upload / Re-upload UI, and Detail Table with Preview/Download

## Mode: PLAN

**Goal:**
1. Replace the free-form "Add document" with **around 5 predefined document types**, each with a **name** and **description**.
2. In the form: show each type with an **Upload** button; on click (mock) show **success** and a **Re-upload** button so the user can "upload" again.
3. On the **detail page** (application and inspection): show documents in a **table** with columns **No., Attachment (name + description), File name, Uploaded**, and **Actions** with **Preview** (eye icon) and **Download** (download icon), matching the reference image.

---

## 1. Document Type Definitions (Predefined)

Define **5 document types** that applicants can "upload" (mock). Each has:
- **id** — stable key (e.g. `payment-receipt`, `qualifications`, `employment-agreement`, `experience-letter`, `facility-floor-plan`).
- **name** — display title (e.g. "Payment Receipt for Evaluation", "Qualifications of Quality Assurance Supervisor Head").
- **description** — short explanation (e.g. "Payment for service fee", "Professional license of Quality Assurance Supervisor Head").

**Suggested 5 types (align with reference image):**

| id | name | description |
|----|------|--------------|
| payment-receipt | Payment Receipt for Evaluation | Payment for service fee |
| qualifications | Qualifications of Quality Assurance Supervisor Head | Professional license of Quality Assurance Supervisor Head |
| employment-agreement | Employment Agreement of Quality Assurance Supervisor Head | Employment Agreement letter of the Quality Assurance Supervisor Head |
| experience-letter | Experience Letter of Quality Assurance Supervisor Head | Experience letter of the Quality Assurance Supervisor Head |
| facility-floor-plan | Facility Floor Plan | Floor plan and layout of the facility |

Store these as a **constant array** (e.g. in `app/data/documentTypes.ts` or inside the wizard page) so the form iterates over them.

---

## 2. Data Model Updates

**ApplicationDocument** (in `app/types/application.ts`) — extend for applicant uploads:
- **documentTypeId?: string** — which of the 5 types (only for `type === "applicant"`). Enables "one upload per type" and mapping back to name/description.
- **description?: string** — optional short description (for table column).
- **fileName?: string** — display file name (e.g. "20260205_094627.PDF") for mock; generated on "upload".

Keep existing: `id`, `name`, `type`, `url`, `uploadedAt`, `uploadedBy?`. System docs (acknowledgement, license_certificate) do not need `documentTypeId` or `fileName`; they can have a default `name` only.

**Invariant (mock):** At most **one applicant document per documentTypeId** per application. So when the user clicks "Re-upload" for a type, we **replace** the existing document for that type (same documentTypeId, new fileName and uploadedAt).

---

## 3. Form / Wizard: Documents Step

**Current:** Single list + "Add document" (name input + button); list shows name + View + Remove.

**New:**
- **List the 5 document types** (from the constant). For each type:
  - **Attachment:** Name (bold/title) and description (muted, below).
  - **State:** Either "not uploaded" or "uploaded".
    - **Not uploaded:** Show an **Upload** button.
    - **Uploaded:** Show success state (e.g. checkmark or "Uploaded" text) and a **Re-upload** button.
- **Mock "Upload":** On click, add (or replace) an applicant document for that `documentTypeId`: `name` and `description` from the type, `fileName` = generated (e.g. `mock_${documentTypeId}_${Date.now()}.pdf` or simple `document_1.pdf` style), `url` = `MOCK_APPLICANT_PDF_URL`, `uploadedAt` = now, `type: "applicant"`.
- **Re-upload:** Same as upload but replace the existing document for that documentTypeId (remove old, add new with new fileName and uploadedAt).
- No free-text document name input; the 5 types are the only options. System-generated docs (acknowledgement, license certificate) are not shown in this list; they appear only on the detail view.

**Wizard state:** Keep `documents: ApplicationDocument[]`. When loading from application, prefill from `application.documents` (applicant docs only for the 5 slots). When building payload, send full `documents` (including system docs if we're editing and they already exist).

---

## 4. Detail Page: Table with Preview and Download

**Where:** Application detail (Documents tab) and Inspection detail (Documents section).

**Layout:** Table (or card-based table) with columns:
- **No.** — row index (1, 2, 3, …).
- **Attachment** — document **name** (primary) and **description** (secondary, muted). For system docs, description can be the type label (e.g. "Acknowledgement") or empty.
- **File name** — `doc.fileName` if present, otherwise a fallback (e.g. "Acknowledgement letter.pdf" for acknowledgement type).
- **Uploaded** — formatted `uploadedAt` (e.g. "Feb 5, 2026").
- **Actions** — two icon buttons:
  - **Preview** — eye icon (e.g. `Eye` from lucide-react); opens `doc.url` in a new tab.
  - **Download** — download icon (e.g. `Download` from lucide-react); same URL with `download` attribute or open in new tab (mock: same PDF URL; browser may open or download).

Use consistent styling: teal/primary for icons, light border, square button look to match the reference.

**Order:** List applicant documents first (by document type order or upload order), then acknowledgement, then license certificate if present.

---

## 5. Implementation Steps

1. **Define document types** — Create `DOCUMENT_TYPES` (array of `{ id, name, description }`) in a small module or in the wizard file.
2. **Extend ApplicationDocument** — Add optional `documentTypeId?: string`, `description?: string`, `fileName?: string`. Ensure mock API and wizard payload accept them.
3. **Wizard Documents step** — Replace current UI with a list of the 5 types. For each type, if there is an applicant doc with that `documentTypeId`, show success + Re-upload; else show Upload. On Upload/Re-upload, add or replace document with generated `fileName` and test PDF URL.
4. **Application detail (Documents tab)** — Switch to table layout; columns No., Attachment (name + description), File name, Uploaded, Actions (Preview + Download icons). Use lucide-react `Eye` and `Download`.
5. **Inspection detail (Documents section)** — Same table and actions (read-only).
6. **File name for system docs** — When creating acknowledgement or license certificate documents, set a default `fileName` (e.g. "Acknowledgement_letter.pdf") so the table has a value. Optional: add `fileName` to the document type in mockApi when appending those docs.

---

## 6. Files to Touch

- **`app/types/application.ts`** — Extend `ApplicationDocument` with `documentTypeId?`, `description?`, `fileName?`.
- **`app/data/documentTypes.ts`** (new) — Export `DOCUMENT_TYPES` (id, name, description) × 5.
- **`app/data/mockApi.ts`** — When creating acknowledgement/license certificate docs, optionally set `fileName`. Ensure `ensureAcknowledgementForSubmittedApplications` and any existing code do not strip new fields.
- **`app/pages/ApplicationWizardPage.tsx`** — Documents step: render 5 types, Upload / success + Re-upload, mock add/replace with `documentTypeId`, `fileName`, `description`.
- **`app/pages/ApplicationDetailPage.tsx`** — Documents tab: table with No., Attachment, File name, Uploaded, Actions (Eye + Download).
- **`app/pages/InspectionDetailPage.tsx`** — Documents: same table and actions.

---

## 7. Mock Behaviour Summary

- **Upload:** No real file picker. Click "Upload" → create an `ApplicationDocument` with `documentTypeId`, `name`, `description` from the type, `fileName` = generated string, `url` = test PDF, `uploadedAt` = now, `type: "applicant"`.
- **Re-upload:** Replace the applicant document for that `documentTypeId` (new `fileName`, new `uploadedAt`; same URL).
- **Preview:** Open `doc.url` in new tab.
- **Download:** Link with `href={doc.url}` and `download` attribute (or open in new tab; mock URL may not force download depending on CORS).

---

**End of plan.** To implement, say **ACT** and proceed with the steps above.
