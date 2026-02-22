/** User role for mock auth and role-based UI */
export type UserRole = "Admin" | "Applicant" | "Team Leader" | "Inspector";

/** Mock user (no password; login by role selection) */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
