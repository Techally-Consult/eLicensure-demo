/** Facility as returned by listFacilities (for renewal/additional service dropdown) */
export interface Facility {
  id: string;
  mfrId: string;
  name: string;
  type: string;
  licenseNumber: string;
  services: string[];
}
