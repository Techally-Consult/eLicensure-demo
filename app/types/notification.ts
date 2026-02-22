/** In-app notification (mock) */
export interface Notification {
  id: string;
  userId: string;
  applicationId?: string;
  type: "status_change" | "assigned" | "inspection_submitted" | "approved" | "returned";
  message: string;
  read: boolean;
  createdAt: string; // ISO
}
