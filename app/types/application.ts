/** License type for the application */
export type LicenseType = "NEW" | "RENEWAL" | "ADDITIONAL_SERVICE";

/** Application status (workflow: Draft → Submitted → Assigned → Under Inspection → Inspection Submitted/Rejected → Approved/Returned to Applicant) */
export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Assigned"
  | "Under Inspection"
  | "Inspection Submitted"
  | "Inspection Rejected"
  | "Under Review"
  | "Approved"
  | "Rejected";

/** Minimal applicant info for list/detail */
export interface ApplicantInfo {
  name: string;
  idType?: string;
  idNumber?: string;
  phone?: string;
  email?: string;
  role?: "owner" | "representative";
  authLetterRef?: string;
}

/** Minimal facility info (embedded in application) */
export interface FacilityInfo {
  name: string;
  type?: string;
  ownershipType?: string;
  region?: string;
  woreda?: string;
  licenseNumber?: string;
}

/** Service item for services list */
export interface ServiceItem {
  name: string;
  level?: string;
  bedCapacity?: number;
}

/** Timeline event for status history */
export interface TimelineEvent {
  date: string; // ISO date string
  label: string;
  remark?: string;
}

/** Inspection result from inspector */
export interface InspectionResult {
  result: "Submitted" | "Rejected";
  remark?: string;
  submittedAt: string; // ISO
  submittedBy: string; // user id
}

/** Staffing head (facility head) */
export interface StaffingHead {
  name: string;
  qualification: string;
  licenseNumber: string;
}

/** One staff row */
export interface StaffRow {
  name: string;
  cadre: string;
  license: string;
}

/** Type-specific data for NEW license */
export interface TypeSpecificNew {
  startDate?: string;
  constructionStatus?: string;
  readyForInspection?: boolean;
}

/** Type-specific data for RENEWAL */
export interface TypeSpecificRenewal {
  licenseNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  changes?: string;
  lastInspection?: string;
  inspectionSummary?: string;
}

/** New service for ADDITIONAL_SERVICE */
export interface NewServiceItem {
  name: string;
  category: string;
  beds: string;
  summary: string;
}

/** Type-specific data for ADDITIONAL_SERVICE */
export interface TypeSpecificAdditional {
  currentServices?: string;
  newServices?: NewServiceItem[];
  justification?: string;
  impact?: string;
}

/** Type-specific block (one of new/renewal/additional by license type) */
export interface TypeSpecific {
  new?: TypeSpecificNew;
  renewal?: TypeSpecificRenewal;
  additional?: TypeSpecificAdditional;
}

/** Application as stored and returned by mock API */
export interface Application {
  id: string;
  licenseType: LicenseType;
  facilityName: string;
  status: ApplicationStatus;
  lastUpdated: string; // ISO date string
  applicant?: ApplicantInfo;
  facility?: FacilityInfo;
  facilityId?: string;
  services?: ServiceItem[];
  totalBeds?: string;
  staffingHead?: StaffingHead;
  staffRows?: StaffRow[];
  infrastructureDescription?: string;
  typeSpecific?: TypeSpecific;
  timeline?: TimelineEvent[];
  /** Inspector user id when status is Assigned / Under Inspection / Inspection Submitted / Inspection Rejected */
  assignedTo?: string;
  /** Inspection result when inspector has submitted */
  inspection?: InspectionResult;
  /** Remark when returned to applicant (team leader) */
  remark?: string;
  /** Applicant user id (owner of the application); used to filter "my applications" for Applicant role */
  applicantUserId?: string;
  /** For RENEWAL applications: id of the application being renewed (source license) */
  sourceApplicationId?: string;
}
