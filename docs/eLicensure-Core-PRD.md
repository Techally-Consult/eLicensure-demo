# eLicensure Static Web App – Wireframes & Flows

## 1. App Goals (Prototype)

- Show end-to-end facility licensing flows (New, Renewal, Additional Service) using static/mock data.  
- Demonstrate screen structure, navigation, and basic form UX.  
- Use TanStack Router for routes/layouts, TanStack Query for mock data fetching, and shadcn + Tailwind for UI components. [web:56][web:59][web:62][web:63]  

---

## 2. Screens (Pages) and Components

### 2.1 Global Layout

**Layout:**  
- `<AppLayout>` with:
  - Top navbar: app title, environment badge (“Demo”), user avatar placeholder.
  - Side nav: links to Dashboard, Applications, New Application, Settings.
  - Main content: renders current route outlet. [web:63]  

**Key components:**
- `AppShell` (layout wrapper, flex with sidebar + content).  
- `NavLink` list using router link components. [web:60][web:63]  

---

### 2.2 Dashboard (`/`)

**Purpose:** High-level overview and entry point.

**UI elements:**
- Summary cards:
  - “Applications in progress”
  - “Submitted”
  - “Approved”
- Table or list of recent applications (from mock data).  
- Primary CTA button: “Start New Application”.  

**Components:**
- `SummaryCard`  
- `ApplicationsTable`  

---

### 2.3 Application List (`/applications`)

**Purpose:** View all applications (mock).

**UI elements:**
- Table columns:
  - Application ID
  - Facility name
  - License type (New / Renewal / Additional Service)
  - Status
  - Last updated
- Status pill (Draft, Submitted, Under Review, Approved, Rejected).  
- Row action: “View” → navigates to detail page.  

**Components:**
- `ApplicationsTable` (reusable).  
- `StatusBadge`.  

---

### 2.4 Application Detail (`/applications/$id`)

**Purpose:** Read-only view of a single application.

**UI elements:**
- Header: Application ID, Status badge, License type.  
- Tabs:
  - Summary
  - Form (read-only view of entered data)
  - Timeline (status history)  
- Timeline list: Created, Submitted, Status changes.  

**Components:**
- `DetailHeader`  
- `Tabs` (from shadcn)  
- `Timeline`  

---

### 2.5 New Application Wizard (`/apply`)

One multi-step wizard supporting all three types: **New / Renewal / Additional Service**.

#### Step 0 – License Type

- Title: “Select License Type”.  
- Radio group:
  - New facility license
  - License renewal
  - Additional service license  
- “Next” enabled only when a type is selected.  

#### Step 1 – Applicant Information

- Fields: applicant name, ID type/number, phone, email, role (owner/representative).  
- If representative: show “Authorization letter reference” field.  

#### Step 2 – Facility Information

- For New:
  - Facility name, type, ownership type, region, woreda, GPS, etc.  
- For Renewal / Additional:
  - “Select existing facility” dropdown from mock facilities,
  - Pre-filled read-only fields for name, type; editable where needed.  

#### Step 3 – Services & Capacity

- Checkbox list of services (OPD, Lab, Pharmacy, Maternity, etc.).  
- For each selected service: service level + optional bed capacity.  
- Total bed capacity field (auto or manual).  

#### Step 4 – Staffing

- Facility head: name, qualification, license number.  
- Simple table for staff (name, cadre, license), with “Add row” button.  

#### Step 5 – Infrastructure

- Textarea for layout description.  
- Placeholder for “Upload floor plan” (no real upload).  

#### Step 6 – Type-Specific

- **New facility:**
  - Intended start date
  - Construction status
  - “Ready for inspection” checkbox  

- **Renewal:**
  - Existing license number, issue date, expiry date
  - “Changes since last license” multi-line field
  - Last inspection date + summary  

- **Additional service:**
  - Show current services list
  - Table for new services (name, category, beds, staff/equipment summary)
  - Justification + impact on current services  

#### Step 7 – Review & Submit

- Accordion or sections for each step with read-only values.  
- Buttons: “Back”, “Submit application”.  
- For mock: “Submit” just updates in-memory status and shows confirmation.  

**Components (shadcn + Tailwind):** [web:62][web:65][web:68]  
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`  
- `RadioGroup`, `Input`, `Textarea`, `Select`, `Checkbox`  
- `Stepper` or simple step indicator  
- `Button` components  

---

## 3. Routing (TanStack Router)

Use a simple route tree. [web:56][web:63][web:66]

- `/` → `DashboardPage`  
- `/applications` → `ApplicationsListPage`  
- `/applications/$id` → `ApplicationDetailPage`  
- `/apply` → `ApplicationWizardPage`  

Attach static route metadata (e.g., titles) using route static data where useful. [web:59][web:63]  

---

## 4. State & Data (TanStack Query + Local State)

### 4.1 Mock Data Structures

**Mock applications:**

- id, licenseType, facilityName, status, lastUpdated  
- minimal nested data for applicant, facility, services, etc.  

**Mock facilities (for renewal/additional service):**

- id, mfrId, name, type, licenseNumber, services[]  

### 4.2 Mock API Layer

- `listApplications()` → returns mock applications array.  
- `getApplication(id)` → returns one mock application.  
- `listFacilities()` → returns mock facilities.  

These functions are async to simulate network calls and are wired into TanStack Query hooks. [web:61][web:64][web:67]  

### 4.3 Query Hooks

- `useApplications()` → list for dashboard and applications list.  
- `useApplication(id)` → detail view.  
- `useFacilities()` → facility dropdown in wizard (for renewal/additional).  

---

## 5. Wizard State (Local)

Maintain wizard form state inside `ApplicationWizardPage`:

- `licenseType`  
- `applicant`  
- `facility`  
- `services`  
- `staffing`  
- `infrastructure`  
- `typeSpecific`  

Use `useState` or `useReducer` to handle step transitions and save partial data. On Submit, push the new application into a local copy of mock applications (for demo only).  

---

## 6. App Flows (Static Demo)

### 6.1 New Facility Flow

- User navigates to `/apply`.  
- Chooses “New facility” and completes steps 1–7.  
- On “Submit”, a new mock application with type “NEW” and status “Submitted” appears in `/applications` and on the Dashboard.  

### 6.2 Renewal Flow

- User navigates to `/apply`.  
- Chooses “License renewal”.  
- Selects an existing facility from dropdown.  
- Form is pre-filled; user edits only changed fields.  
- On “Submit”, a “RENEWAL” application is added to the list.  

### 6.3 Additional Service Flow

- User navigates to `/apply`.  
- Chooses “Additional service license”.  
- Selects existing facility.  
- Adds new services in the type-specific step.  
- On “Submit”, an “ADDITIONAL_SERVICE” application appears in the list.  

---

## 7. UI Notes (shadcn + Tailwind)

- Use shadcn form patterns for consistent validation, labels, and errors. [web:62][web:68]  
- Tailwind for layout and spacing: `container`, `max-w-3xl`, `mx-auto`, `flex`, `gap-4`. [web:65]  
- Use consistent button styles for “Next”, “Back”, and “Submit”.  
- Optional: use a toast/alert component to show “Application submitted (mock)” message.  

