/** License type for the application */
export type LicenseType = "NEW" | "RENEWAL" | "ADDITIONAL_SERVICE";

/** Application status */
export type ApplicationStatus =
  | "Draft"
  | "Submitted"
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

/** Application as stored and returned by mock API */
export interface Application {
  id: string;
  licenseType: LicenseType;
  facilityName: string;
  status: ApplicationStatus;
  lastUpdated: string; // ISO date string
  applicant?: ApplicantInfo;
  facility?: FacilityInfo;
  services?: ServiceItem[];
}
