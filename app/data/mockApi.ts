import type {
  Application,
  ApplicationDocument,
  ApplicationStatus,
  InspectionResult,
} from "~/types/application";
import type { Facility } from "~/types/facility";
import type { UserRole } from "~/types/auth";
import { addNotification } from "~/data/mockNotifications";
import { DOCUMENT_TYPES } from "~/data/documentTypes";

export type ListApplicationsOptions = { role?: UserRole; userId?: string };

const APPLICANT_USER_ID = "user-applicant";
const TEAM_LEADER_USER_ID = "user-tl";

/** Test PDF URLs for mock documents (no real upload) */
export const MOCK_ACKNOWLEDGEMENT_PDF_URL =
  "https://www.w3.org/WAI/WCAG21/Techniques/pdf/example.pdf";
export const MOCK_LICENSE_CERTIFICATE_PDF_URL =
  "https://www.w3.org/WAI/WAI20/test-assets/PDFs/table.pdf";
export const MOCK_APPLICANT_PDF_URL =
  "https://www.w3.org/WAI/WCAG21/Techniques/pdf/example.pdf";

function newDocId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** In-memory store for demo. Mutations (e.g. submit) update this. */
const applicationsStore: Application[] = [
  {
    id: "APP-001",
    licenseType: "NEW",
    facilityName: "Sunrise Health Center",
    status: "Submitted",
    lastUpdated: "2025-02-18T10:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    applicant: {
      name: "Abebe Kebede",
      idType: "National ID",
      idNumber: "IDN-001-123",
      phone: "+251911123456",
      email: "abebe@example.com",
      role: "owner",
    },
    facility: {
      name: "Sunrise Health Center",
      type: "Health Center",
      ownershipType: "Private",
      region: "Addis Ababa",
      woreda: "Bole",
    },
    services: [
      { name: "OPD", level: "Level 2", bedCapacity: 10 },
      { name: "Lab", level: "Basic", bedCapacity: 0 },
      { name: "Pharmacy", level: "Full", bedCapacity: 0 },
    ],
    totalBeds: "24",
    staffingHead: {
      name: "Dr. Abebe Kebede",
      qualification: "MD, General Practice",
      licenseNumber: "MED-2015-001",
    },
    staffRows: [
      { name: "Sara Hailu", cadre: "Nurse", license: "RN-2020-012" },
      { name: "Dawit Mekonnen", cadre: "Pharmacist", license: "PH-2019-005" },
    ],
    infrastructureDescription: "Two-story building with OPD on ground floor, lab and pharmacy on first floor. Adequate waiting area and parking.",
    typeSpecific: {
      new: {
        startDate: "2025-03-01",
        constructionStatus: "Complete",
        readyForInspection: true,
      },
    },
    timeline: [
      { date: "2025-02-17T09:00:00Z", label: "Created" },
      { date: "2025-02-18T10:00:00Z", label: "Submitted" },
    ],
  },
  {
    id: "APP-002",
    licenseType: "RENEWAL",
    facilityName: "Mercy General Clinic",
    status: "Assigned",
    lastUpdated: "2025-02-19T14:30:00Z",
    applicantUserId: APPLICANT_USER_ID,
    assignedTo: "user-inspector",
    facilityId: "fac-1",
    applicant: {
      name: "Tigist Hailu",
      idType: "Passport",
      idNumber: "P123456",
      phone: "+251922789012",
      email: "tigist@example.com",
      role: "representative",
      authLetterRef: "AUTH-2025-002",
    },
    facility: { name: "Mercy General Clinic", type: "Clinic", licenseNumber: "LIC-2019-042" },
    services: [
      { name: "OPD", level: "Level 1", bedCapacity: 5 },
      { name: "Pharmacy", level: "Basic", bedCapacity: 0 },
    ],
    totalBeds: "12",
    staffingHead: {
      name: "Dr. Tigist Hailu",
      qualification: "MD",
      licenseNumber: "MED-2018-042",
    },
    staffRows: [{ name: "Meron Tesfaye", cadre: "Nurse", license: "RN-2021-008" }],
    infrastructureDescription: "Single-floor clinic with OPD and pharmacy. Renovated in 2024.",
    typeSpecific: {
      renewal: {
        licenseNumber: "LIC-2019-042",
        issueDate: "2019-06-15",
        expiryDate: "2025-06-14",
        changes: "Added one consultation room.",
        lastInspection: "2024-08-20",
        inspectionSummary: "No major findings.",
      },
    },
    timeline: [
      { date: "2025-02-18T08:00:00Z", label: "Created" },
      { date: "2025-02-18T12:00:00Z", label: "Submitted" },
      { date: "2025-02-19T14:30:00Z", label: "Under Review" },
    ],
  },
  {
    id: "APP-003",
    licenseType: "ADDITIONAL_SERVICE",
    facilityName: "Hope Medical Center",
    status: "Approved",
    lastUpdated: "2025-02-15T09:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    facilityId: "fac-2",
    applicant: {
      name: "Dawit Bekele",
      idType: "National ID",
      idNumber: "IDN-002-456",
      phone: "+251933456789",
      email: "dawit@example.com",
      role: "owner",
    },
    facility: { name: "Hope Medical Center", type: "Hospital", licenseNumber: "LIC-2020-101" },
    services: [
      { name: "OPD", level: "Level 3", bedCapacity: 20 },
      { name: "Lab", level: "Full", bedCapacity: 0 },
      { name: "Pharmacy", level: "Full", bedCapacity: 0 },
      { name: "Maternity", level: "Level 2", bedCapacity: 15 },
    ],
    totalBeds: "50",
    staffingHead: {
      name: "Dr. Dawit Bekele",
      qualification: "MD, Specialist",
      licenseNumber: "MED-2010-101",
    },
    staffRows: [
      { name: "Helen Desta", cadre: "Midwife", license: "MW-2019-003" },
      { name: "Yonas Abebe", cadre: "Lab Tech", license: "LT-2020-007" },
    ],
    infrastructureDescription: "Hospital with maternity wing, lab, and pharmacy. Equipped for basic surgery.",
    typeSpecific: {
      additional: {
        currentServices: "OPD, Lab, Pharmacy",
        newServices: [
          { name: "Maternity", category: "Clinical", beds: "15", summary: "New maternity ward with delivery rooms." },
        ],
        justification: "High demand for maternal care in the region.",
        impact: "Will reduce referral burden and improve access.",
      },
    },
    timeline: [
      { date: "2025-02-12T10:00:00Z", label: "Created" },
      { date: "2025-02-13T11:00:00Z", label: "Submitted" },
      { date: "2025-02-14T14:00:00Z", label: "Under Review" },
      { date: "2025-02-15T09:00:00Z", label: "Approved" },
    ],
  },
  {
    id: "APP-004",
    licenseType: "NEW",
    facilityName: "Bole Family Clinic",
    status: "Draft",
    lastUpdated: "2025-02-20T08:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    applicant: {
      name: "Meron Abebe",
      idType: "National ID",
      idNumber: "IDN-004-789",
      phone: "+251944111222",
      email: "meron@example.com",
      role: "owner",
    },
    facility: {
      name: "Bole Family Clinic",
      type: "Clinic",
      ownershipType: "Private",
      region: "Addis Ababa",
      woreda: "Bole",
    },
    services: [{ name: "OPD", level: "Level 1", bedCapacity: 4 }],
    totalBeds: "8",
    staffingHead: {
      name: "Meron Abebe",
      qualification: "Health Officer",
      licenseNumber: "HO-2022-004",
    },
    staffRows: [],
    infrastructureDescription: "Small clinic under setup. Single consultation room.",
    typeSpecific: {
      new: {
        startDate: "2025-04-01",
        constructionStatus: "In progress",
        readyForInspection: false,
      },
    },
    timeline: [{ date: "2025-02-19T14:00:00Z", label: "Created" }],
  },
  {
    id: "APP-005",
    licenseType: "RENEWAL",
    facilityName: "Kality Health Post",
    status: "Submitted",
    lastUpdated: "2025-02-18T11:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    applicant: {
      name: "Getachew Tesfaye",
      idType: "National ID",
      idNumber: "IDN-005-321",
      phone: "+251955333444",
      email: "getachew@example.com",
      role: "representative",
      authLetterRef: "AUTH-2025-005",
    },
    facility: { name: "Kality Health Post", type: "Health Post", licenseNumber: "LIC-2018-088" },
    services: [
      { name: "OPD", level: "Basic", bedCapacity: 2 },
    ],
    totalBeds: "4",
    staffingHead: {
      name: "Getachew Tesfaye",
      qualification: "Health Extension",
      licenseNumber: "HE-2018-088",
    },
    staffRows: [{ name: "Tigist Kebede", cadre: "HEW", license: "HEW-2019-022" }],
    infrastructureDescription: "Health post serving Kality area. Basic OPD and immunization.",
    typeSpecific: {
      renewal: {
        licenseNumber: "LIC-2018-088",
        issueDate: "2018-09-01",
        expiryDate: "2024-08-31",
        changes: "None.",
        lastInspection: "2024-05-10",
        inspectionSummary: "Compliant.",
      },
    },
    timeline: [
      { date: "2025-02-17T09:00:00Z", label: "Created" },
      { date: "2025-02-18T11:00:00Z", label: "Submitted" },
    ],
  },
  {
    id: "APP-006",
    licenseType: "NEW",
    facilityName: "Lebu Specialty Center",
    status: "Under Inspection",
    lastUpdated: "2025-02-19T16:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    assignedTo: "user-inspector",
    applicant: {
      name: "Sara Mohammed",
      idType: "National ID",
      idNumber: "IDN-006-654",
      phone: "+251966555666",
      email: "sara@example.com",
      role: "owner",
    },
    facility: {
      name: "Lebu Specialty Center",
      type: "Specialty Center",
      ownershipType: "Private",
      region: "Oromia",
      woreda: "Lebu",
    },
    services: [
      { name: "OPD", level: "Level 2", bedCapacity: 8 },
      { name: "Lab", level: "Full", bedCapacity: 0 },
      { name: "Imaging", level: "Basic", bedCapacity: 0 },
    ],
    totalBeds: "16",
    staffingHead: {
      name: "Dr. Sara Mohammed",
      qualification: "MD, Radiology",
      licenseNumber: "MED-2016-020",
    },
    staffRows: [
      { name: "Abel Desta", cadre: "Radiologist", license: "RAD-2020-004" },
      { name: "Marta Hailu", cadre: "Nurse", license: "RN-2021-015" },
    ],
    infrastructureDescription: "Specialty center with imaging and lab. Two floors.",
    typeSpecific: {
      new: {
        startDate: "2025-02-01",
        constructionStatus: "Complete",
        readyForInspection: true,
      },
    },
    timeline: [
      { date: "2025-02-10T10:00:00Z", label: "Created" },
      { date: "2025-02-11T12:00:00Z", label: "Submitted" },
      { date: "2025-02-19T16:00:00Z", label: "Under Review" },
    ],
  },
  {
    id: "APP-007",
    licenseType: "ADDITIONAL_SERVICE",
    facilityName: "Sunrise Health Center",
    status: "Approved",
    lastUpdated: "2025-02-14T10:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    applicant: {
      name: "Abebe Kebede",
      idType: "National ID",
      idNumber: "IDN-001-123",
      phone: "+251911123456",
      email: "abebe@example.com",
      role: "owner",
    },
    facility: { name: "Sunrise Health Center", type: "Health Center", licenseNumber: "LIC-2021-012" },
    services: [
      { name: "OPD", level: "Level 2", bedCapacity: 10 },
      { name: "Lab", level: "Basic", bedCapacity: 0 },
      { name: "Pharmacy", level: "Full", bedCapacity: 0 },
      { name: "Maternity", level: "Level 1", bedCapacity: 6 },
    ],
    totalBeds: "30",
    staffingHead: {
      name: "Dr. Abebe Kebede",
      qualification: "MD, General Practice",
      licenseNumber: "MED-2015-001",
    },
    staffRows: [
      { name: "Sara Hailu", cadre: "Nurse", license: "RN-2020-012" },
      { name: "Helen Desta", cadre: "Midwife", license: "MW-2021-009" },
    ],
    infrastructureDescription: "Health center with existing OPD, lab, pharmacy. New maternity wing added.",
    typeSpecific: {
      additional: {
        currentServices: "OPD, Lab, Pharmacy",
        newServices: [
          { name: "Maternity", category: "Clinical", beds: "6", summary: "Basic maternity and delivery." },
        ],
        justification: "Community demand for local maternal care.",
        impact: "Reduces referrals to Gondar hospital.",
      },
    },
    timeline: [
      { date: "2025-02-01T09:00:00Z", label: "Created" },
      { date: "2025-02-02T10:00:00Z", label: "Submitted" },
      { date: "2025-02-10T14:00:00Z", label: "Under Review" },
      { date: "2025-02-14T10:00:00Z", label: "Approved" },
    ],
  },
  {
    id: "APP-008",
    licenseType: "RENEWAL",
    facilityName: "Akaki General Hospital",
    status: "Rejected",
    lastUpdated: "2025-02-12T09:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    applicant: {
      name: "Yonas Desta",
      idType: "National ID",
      idNumber: "IDN-008-987",
      phone: "+251977777888",
      email: "yonas@example.com",
      role: "owner",
    },
    facility: { name: "Akaki General Hospital", type: "Hospital", licenseNumber: "LIC-2019-033" },
    services: [
      { name: "OPD", level: "Level 3", bedCapacity: 30 },
      { name: "Lab", level: "Full", bedCapacity: 0 },
      { name: "Pharmacy", level: "Full", bedCapacity: 0 },
      { name: "Maternity", level: "Level 2", bedCapacity: 20 },
      { name: "Surgery", level: "Level 1", bedCapacity: 10 },
    ],
    totalBeds: "80",
    staffingHead: {
      name: "Dr. Yonas Desta",
      qualification: "MD, Surgery",
      licenseNumber: "MED-2012-033",
    },
    staffRows: [
      { name: "Kebede Alemu", cadre: "Anesthetist", license: "ANES-2018-002" },
      { name: "Tigist Abebe", cadre: "Nurse", license: "RN-2019-020" },
    ],
    infrastructureDescription: "General hospital. Renewal application did not meet compliance criteria.",
    typeSpecific: {
      renewal: {
        licenseNumber: "LIC-2019-033",
        issueDate: "2019-04-01",
        expiryDate: "2025-03-31",
        changes: "Expanded surgery wing.",
        lastInspection: "2024-11-15",
        inspectionSummary: "Non-compliance in sterilization and record-keeping.",
      },
    },
    timeline: [
      { date: "2025-01-28T08:00:00Z", label: "Created" },
      { date: "2025-01-29T11:00:00Z", label: "Submitted" },
      { date: "2025-02-05T14:00:00Z", label: "Under Review" },
      { date: "2025-02-12T09:00:00Z", label: "Rejected" },
    ],
  },
  {
    id: "APP-009",
    licenseType: "NEW",
    facilityName: "Gondar Medical Hub",
    status: "Submitted",
    lastUpdated: "2025-02-17T15:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    applicant: {
      name: "Helen Tadesse",
      idType: "National ID",
      idNumber: "IDN-009-147",
      phone: "+251988999000",
      email: "helen@example.com",
      role: "owner",
    },
    facility: {
      name: "Gondar Medical Hub",
      type: "Hospital",
      ownershipType: "Private",
      region: "Amhara",
      woreda: "Gondar Town",
    },
    services: [
      { name: "OPD", level: "Level 3", bedCapacity: 25 },
      { name: "Lab", level: "Full", bedCapacity: 0 },
      { name: "Pharmacy", level: "Full", bedCapacity: 0 },
      { name: "Maternity", level: "Level 2", bedCapacity: 18 },
      { name: "Surgery", level: "Level 2", bedCapacity: 12 },
    ],
    totalBeds: "60",
    staffingHead: {
      name: "Dr. Helen Tadesse",
      qualification: "MD, Obstetrics",
      licenseNumber: "MED-2014-015",
    },
    staffRows: [
      { name: "Daniel Assefa", cadre: "Surgeon", license: "SUR-2017-006" },
      { name: "Meron Tadesse", cadre: "Nurse", license: "RN-2020-018" },
    ],
    infrastructureDescription: "New hospital in Gondar. Full OPD, lab, pharmacy, maternity, and surgery.",
    typeSpecific: {
      new: {
        startDate: "2025-05-01",
        constructionStatus: "Complete",
        readyForInspection: true,
      },
    },
    timeline: [
      { date: "2025-02-15T10:00:00Z", label: "Created" },
      { date: "2025-02-17T15:00:00Z", label: "Submitted" },
    ],
  },
  {
    id: "APP-010",
    licenseType: "RENEWAL",
    facilityName: "Hawassa Community Clinic",
    status: "Draft",
    lastUpdated: "2025-02-16T12:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    applicant: {
      name: "Daniel Assefa",
      idType: "National ID",
      idNumber: "IDN-010-258",
      phone: "+251911222333",
      email: "daniel@example.com",
      role: "representative",
      authLetterRef: "AUTH-2025-010",
    },
    facility: { name: "Hawassa Community Clinic", type: "Clinic", licenseNumber: "LIC-2020-055" },
    services: [
      { name: "OPD", level: "Level 1", bedCapacity: 6 },
      { name: "Pharmacy", level: "Basic", bedCapacity: 0 },
    ],
    totalBeds: "10",
    staffingHead: {
      name: "Daniel Assefa",
      qualification: "Health Officer",
      licenseNumber: "HO-2020-055",
    },
    staffRows: [{ name: "Sara Kebede", cadre: "Nurse", license: "RN-2022-011" }],
    infrastructureDescription: "Community clinic in Hawassa. OPD and pharmacy. Renewal in progress.",
    typeSpecific: {
      renewal: {
        licenseNumber: "LIC-2020-055",
        issueDate: "2020-03-15",
        expiryDate: "2025-03-14",
        changes: "Extended opening hours.",
        lastInspection: "2024-07-01",
        inspectionSummary: "Minor recommendations.",
      },
    },
    timeline: [{ date: "2025-02-16T12:00:00Z", label: "Created" }],
  },
  {
    id: "APP-011",
    licenseType: "ADDITIONAL_SERVICE",
    facilityName: "Mercy General Clinic",
    status: "Inspection Submitted",
    lastUpdated: "2025-02-20T09:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    assignedTo: "user-inspector",
    facilityId: "fac-1",
    applicant: {
      name: "Tigist Hailu",
      idType: "Passport",
      idNumber: "P123456",
      phone: "+251922789012",
      email: "tigist@example.com",
      role: "representative",
      authLetterRef: "AUTH-2025-011",
    },
    facility: { name: "Mercy General Clinic", type: "Clinic", licenseNumber: "LIC-2019-042" },
    services: [
      { name: "OPD", level: "Level 1", bedCapacity: 5 },
      { name: "Pharmacy", level: "Basic", bedCapacity: 0 },
      { name: "Lab", level: "Basic", bedCapacity: 0 },
    ],
    totalBeds: "14",
    staffingHead: {
      name: "Dr. Tigist Hailu",
      qualification: "MD",
      licenseNumber: "MED-2018-042",
    },
    staffRows: [
      { name: "Meron Tesfaye", cadre: "Nurse", license: "RN-2021-008" },
      { name: "Dawit Hailu", cadre: "Lab Tech", license: "LT-2023-001" },
    ],
    infrastructureDescription: "Clinic adding lab service. Existing OPD and pharmacy.",
    typeSpecific: {
      additional: {
        currentServices: "OPD, Pharmacy",
        newServices: [
          { name: "Lab", category: "Diagnostic", beds: "0", summary: "Basic lab for CBC, urinalysis." },
        ],
        justification: "Reduce external lab referrals.",
        impact: "Faster turnaround for common tests.",
      },
    },
    timeline: [
      { date: "2025-02-06T10:00:00Z", label: "Created" },
      { date: "2025-02-07T11:00:00Z", label: "Submitted" },
      { date: "2025-02-20T09:00:00Z", label: "Under Review" },
    ],
  },
  {
    id: "APP-012",
    licenseType: "NEW",
    facilityName: "Dire Dawa Health Center",
    status: "Approved",
    lastUpdated: "2025-01-30T14:00:00Z",
    applicantUserId: APPLICANT_USER_ID,
    applicant: {
      name: "Kebede Alemu",
      idType: "National ID",
      idNumber: "IDN-012-369",
      phone: "+251933444555",
      email: "kebede@example.com",
      role: "owner",
    },
    facility: {
      name: "Dire Dawa Health Center",
      type: "Health Center",
      ownershipType: "Private",
      region: "Dire Dawa",
      woreda: "Kebele 01",
    },
    services: [
      { name: "OPD", level: "Level 2", bedCapacity: 12 },
      { name: "Lab", level: "Basic", bedCapacity: 0 },
      { name: "Pharmacy", level: "Full", bedCapacity: 0 },
      { name: "Maternity", level: "Level 1", bedCapacity: 8 },
    ],
    totalBeds: "28",
    staffingHead: {
      name: "Dr. Kebede Alemu",
      qualification: "MD, General Practice",
      licenseNumber: "MED-2013-008",
    },
    staffRows: [
      { name: "Tigist Mohammed", cadre: "Nurse", license: "RN-2019-005" },
      { name: "Helen Yonas", cadre: "Midwife", license: "MW-2020-006" },
    ],
    infrastructureDescription: "Health center in Dire Dawa. OPD, lab, pharmacy, maternity.",
    typeSpecific: {
      new: {
        startDate: "2025-01-20",
        constructionStatus: "Complete",
        readyForInspection: true,
      },
    },
    timeline: [
      { date: "2025-01-15T09:00:00Z", label: "Created" },
      { date: "2025-01-16T10:00:00Z", label: "Submitted" },
      { date: "2025-01-25T11:00:00Z", label: "Under Review" },
      { date: "2025-01-30T14:00:00Z", label: "Approved" },
    ],
  },
];

/** Add at least two facility-licensing applicant documents to each application (seed data). */
function seedApplicantDocuments(): void {
  const typesToUse = [
    DOCUMENT_TYPES.find((t) => t.id === "facility-floor-plan")!,
    DOCUMENT_TYPES.find((t) => t.id === "qualifications")!,
  ];
  for (const app of applicationsStore) {
    const existing = app.documents ?? [];
    const applicantDocs = existing.filter((d) => d.type === "applicant");
    if (applicantDocs.length >= 2) continue;
    const added: ApplicationDocument[] = [];
    for (let i = 0; i < 2; i++) {
      const docType = typesToUse[i];
      added.push({
        id: `doc-seed-${app.id}-${i + 1}`,
        name: docType.name,
        description: docType.description,
        documentTypeId: docType.id,
        type: "applicant",
        url: MOCK_APPLICANT_PDF_URL,
        uploadedAt: app.lastUpdated,
        fileName: `seed_${docType.id}_${app.id}.pdf`,
      });
    }
    app.documents = [...existing, ...added];
  }
}
seedApplicantDocuments();

/** Ensure every submitted application (status !== Draft) has an acknowledgement document. Run once at load. */
function ensureAcknowledgementForSubmittedApplications(): void {
  for (const app of applicationsStore) {
    if (app.status === "Draft") continue;
    const docs = app.documents ?? [];
    if (docs.some((d) => d.type === "acknowledgement")) continue;
    const acknowledgementDoc: ApplicationDocument = {
      id: newDocId(),
      name: "Acknowledgement letter",
      type: "acknowledgement",
      url: MOCK_ACKNOWLEDGEMENT_PDF_URL,
      uploadedAt: app.lastUpdated,
      fileName: "Acknowledgement_letter.pdf",
      description: "Acknowledgement",
    };
    app.documents = [...docs, acknowledgementDoc];
  }
}
ensureAcknowledgementForSubmittedApplications();

const facilitiesStore: Facility[] = [
  {
    id: "fac-1",
    mfrId: "MFR-1001",
    name: "Mercy General Clinic",
    type: "Clinic",
    licenseNumber: "LIC-2019-042",
    services: ["OPD", "Pharmacy"],
  },
  {
    id: "fac-2",
    mfrId: "MFR-1002",
    name: "Hope Medical Center",
    type: "Hospital",
    licenseNumber: "LIC-2020-101",
    services: ["OPD", "Lab", "Pharmacy", "Maternity"],
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Simulate network delay (optional, e.g. 100–200ms) */
const MOCK_DELAY_MS = 80;

export async function listApplications(
  options?: ListApplicationsOptions
): Promise<Application[]> {
  await delay(MOCK_DELAY_MS);
  const { role, userId } = options ?? {};
  if (role === "Applicant" && userId) {
    return applicationsStore.filter((a) => a.applicantUserId === userId);
  }
  if (role === "Inspector" && userId) {
    return applicationsStore.filter((a) => a.assignedTo === userId);
  }
  if (role === "Team Leader" || role === "Admin") {
    return [...applicationsStore];
  }
  return [...applicationsStore];
}

export async function getApplication(id: string): Promise<Application | null> {
  await delay(MOCK_DELAY_MS);
  return applicationsStore.find((a) => a.id === id) ?? null;
}

export async function listFacilities(): Promise<Facility[]> {
  await delay(MOCK_DELAY_MS);
  return [...facilitiesStore];
}

/** Payload for creating or updating an application (full form). */
export type ApplicationPayload = Omit<Application, "id" | "lastUpdated" | "timeline"> & {
  status?: ApplicationStatus;
};

/** Add a new application to the store (for wizard submit). Returns the created application. */
export function submitApplication(application: ApplicationPayload): Application {
  const id = `APP-${String(applicationsStore.length + 1).padStart(3, "0")}`;
  const lastUpdated = new Date().toISOString();
  const status: ApplicationStatus = application.status ?? "Submitted";
  const baseDocs = application.documents ?? [];
  const acknowledgementDoc: ApplicationDocument | null =
    status === "Submitted" &&
    !baseDocs.some((d) => d.type === "acknowledgement")
      ? {
          id: newDocId(),
          name: "Acknowledgement letter",
          type: "acknowledgement",
          url: MOCK_ACKNOWLEDGEMENT_PDF_URL,
          uploadedAt: lastUpdated,
          fileName: "Acknowledgement_letter.pdf",
          description: "Acknowledgement",
        }
      : null;
  const documents =
    acknowledgementDoc !== null
      ? [...baseDocs, acknowledgementDoc]
      : baseDocs.length > 0
        ? baseDocs
        : undefined;
  const created: Application = {
    ...application,
    id,
    lastUpdated,
    status,
    documents,
    timeline: [
      { date: lastUpdated, label: "Created" },
      { date: lastUpdated, label: "Submitted" },
    ],
  };
  applicationsStore.push(created);
  return created;
}

/** Update an existing application by id. Merges payload into existing (timeline is never overwritten). Returns updated or null. */
export function updateApplication(
  id: string,
  payload: Partial<Omit<ApplicationPayload, "timeline">>
): Application | null {
  const index = applicationsStore.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const lastUpdated = new Date().toISOString();
  const rest = { ...payload };
  delete (rest as Record<string, unknown>).timeline;
  const updated: Application = {
    ...applicationsStore[index],
    ...rest,
    id,
    lastUpdated,
  };
  applicationsStore[index] = updated;
  return updated;
}

/** Update only the status of an application and append to timeline. Returns updated or null. */
export function updateApplicationStatus(
  id: string,
  newStatus: ApplicationStatus,
  remark?: string
): Application | null {
  const index = applicationsStore.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const lastUpdated = new Date().toISOString();
  const existing = applicationsStore[index];
  const existingDocs = existing.documents ?? [];
  const hasAcknowledgement = existingDocs.some((d) => d.type === "acknowledgement");
  const acknowledgementDoc: ApplicationDocument | null =
    newStatus === "Submitted" && !hasAcknowledgement
      ? {
          id: newDocId(),
          name: "Acknowledgement letter",
          type: "acknowledgement",
          url: MOCK_ACKNOWLEDGEMENT_PDF_URL,
          uploadedAt: lastUpdated,
          fileName: "Acknowledgement_letter.pdf",
          description: "Acknowledgement",
        }
      : null;
  const documents =
    acknowledgementDoc !== null
      ? [...existingDocs, acknowledgementDoc]
      : existingDocs.length > 0
        ? existingDocs
        : undefined;
  const updated: Application = {
    ...existing,
    status: newStatus,
    lastUpdated,
    ...(documents !== undefined && { documents }),
    ...(remark !== undefined && { remark }),
    timeline: [
      ...(existing.timeline ?? []),
      { date: lastUpdated, label: newStatus, ...(remark && { remark }) },
    ],
  };
  applicationsStore[index] = updated;
  addNotification(APPLICANT_USER_ID, {
    applicationId: id,
    type: "status_change",
    message: `Application ${id} status changed to ${newStatus}.`,
  });
  return updated;
}

/** Team leader: assign application to inspector. Status → Assigned, sets assignedTo. */
export function assignApplication(
  id: string,
  inspectorId: string
): Application | null {
  const index = applicationsStore.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const lastUpdated = new Date().toISOString();
  const existing = applicationsStore[index];
  const updated: Application = {
    ...existing,
    status: "Assigned",
    assignedTo: inspectorId,
    lastUpdated,
    timeline: [
      ...(existing.timeline ?? []),
      { date: lastUpdated, label: "Assigned" },
    ],
  };
  applicationsStore[index] = updated;
  return updated;
}

/** Inspector: set application to Under Inspection when they start (optional; or do it on assign). */
export function setUnderInspection(id: string): Application | null {
  return updateApplicationStatus(id, "Under Inspection");
}

/** Inspector: submit inspection result. Status → Inspection Submitted or Inspection Rejected. */
export function submitInspection(
  id: string,
  result: "Submitted" | "Rejected",
  remark: string,
  submittedBy: string
): Application | null {
  const index = applicationsStore.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const lastUpdated = new Date().toISOString();
  const existing = applicationsStore[index];
  const inspection: InspectionResult = {
    result,
    remark: remark || undefined,
    submittedAt: lastUpdated,
    submittedBy,
  };
  const newStatus: ApplicationStatus =
    result === "Submitted" ? "Inspection Submitted" : "Inspection Rejected";
  const updated: Application = {
    ...existing,
    status: newStatus,
    inspection,
    lastUpdated,
    timeline: [
      ...(existing.timeline ?? []),
      { date: lastUpdated, label: newStatus, remark: remark || undefined },
    ],
  };
  applicationsStore[index] = updated;
  addNotification(TEAM_LEADER_USER_ID, {
    applicationId: id,
    type: "inspection_submitted",
    message: `Inspection submitted for application ${id} (${existing.facilityName}). Result: ${result}.`,
  });
  addNotification(APPLICANT_USER_ID, {
    applicationId: id,
    type: "status_change",
    message: `Application ${id} inspection result: ${newStatus}.`,
  });
  return updated;
}

/** Team leader: approve license. Status → Approved. Appends license certificate document. */
export function approveLicense(id: string): Application | null {
  const app = applicationsStore.find((a) => a.id === id);
  const updated = updateApplicationStatus(id, "Approved");
  if (!updated) return null;
  const hasCertificate = (updated.documents ?? []).some(
    (d) => d.type === "license_certificate"
  );
  if (!hasCertificate) {
    const licenseDoc: ApplicationDocument = {
      id: newDocId(),
      name: "License certificate",
      type: "license_certificate",
      url: MOCK_LICENSE_CERTIFICATE_PDF_URL,
      uploadedAt: updated.lastUpdated,
      fileName: "License_certificate.pdf",
      description: "License certificate",
    };
    updateApplication(id, {
      documents: [...(updated.documents ?? []), licenseDoc],
    });
  }
  addNotification(APPLICANT_USER_ID, {
    applicationId: id,
    type: "approved",
    message: `Application ${id} (${app?.facilityName ?? id}) has been approved.`,
  });
  return applicationsStore.find((a) => a.id === id) ?? updated;
}

/** Team leader: return to applicant with remark. Status → Rejected, sets remark. */
export function returnToApplicant(id: string, remark: string): Application | null {
  const app = applicationsStore.find((a) => a.id === id);
  const updated = updateApplicationStatus(id, "Rejected", remark);
  if (updated) {
    addNotification(APPLICANT_USER_ID, {
      applicationId: id,
      type: "returned",
      message: `Application ${id} (${app?.facilityName ?? id}) was returned. ${remark ? `Remark: ${remark}` : ""}`,
    });
  }
  return updated;
}
