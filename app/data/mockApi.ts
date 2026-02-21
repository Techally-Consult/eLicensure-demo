import type { Application, ApplicationStatus } from "~/types/application";
import type { Facility } from "~/types/facility";

/** In-memory store for demo. Mutations (e.g. submit) update this. */
const applicationsStore: Application[] = [
  {
    id: "APP-001",
    licenseType: "NEW",
    facilityName: "Sunrise Health Center",
    status: "Submitted",
    lastUpdated: "2025-02-18T10:00:00Z",
    applicant: { name: "Abebe Kebede", email: "abebe@example.com", role: "owner" },
    facility: { name: "Sunrise Health Center", type: "Health Center", region: "Addis Ababa" },
  },
  {
    id: "APP-002",
    licenseType: "RENEWAL",
    facilityName: "Mercy General Clinic",
    status: "Under Review",
    lastUpdated: "2025-02-19T14:30:00Z",
    applicant: { name: "Tigist Hailu", email: "tigist@example.com", role: "representative" },
    facility: { name: "Mercy General Clinic", type: "Clinic", licenseNumber: "LIC-2019-042" },
  },
  {
    id: "APP-003",
    licenseType: "ADDITIONAL_SERVICE",
    facilityName: "Hope Medical Center",
    status: "Approved",
    lastUpdated: "2025-02-15T09:00:00Z",
    applicant: { name: "Dawit Bekele", email: "dawit@example.com", role: "owner" },
    facility: { name: "Hope Medical Center", type: "Hospital", licenseNumber: "LIC-2020-101" },
  },
];

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

export async function listApplications(): Promise<Application[]> {
  await delay(MOCK_DELAY_MS);
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

/** Add a new application to the store (for wizard submit). Returns the created application. */
export function submitApplication(
  application: Omit<Application, "id" | "lastUpdated">
): Application {
  const id = `APP-${String(applicationsStore.length + 1).padStart(3, "0")}`;
  const lastUpdated = new Date().toISOString();
  const status: ApplicationStatus = application.status ?? "Submitted";
  const created: Application = {
    ...application,
    id,
    lastUpdated,
    status,
  };
  applicationsStore.push(created);
  return created;
}
