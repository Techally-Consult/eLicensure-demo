import type { User, UserRole } from "~/types/auth";

export const MOCK_USERS: User[] = [
  { id: "user-admin", email: "admin@demo.com", name: "Admin User", role: "Admin" },
  { id: "user-applicant", email: "applicant@demo.com", name: "Applicant User", role: "Applicant" },
  { id: "user-tl", email: "teamleader@demo.com", name: "Team Leader User", role: "Team Leader" },
  { id: "user-inspector", email: "inspector@demo.com", name: "Inspector User", role: "Inspector" },
];

const STORAGE_KEY = "elicensure-demo-user";

export function getStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(STORAGE_KEY);
}

export function getMockUsers(): User[] {
  return [...MOCK_USERS];
}

export function getUsersByRole(role: UserRole): User[] {
  return MOCK_USERS.filter((u) => u.role === role);
}
