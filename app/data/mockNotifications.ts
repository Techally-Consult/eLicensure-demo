import type { Notification } from "~/types/notification";

const store = new Map<string, Notification[]>();
let nextId = 1;
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function getNotifications(userId: string): Notification[] {
  return [...(store.get(userId) ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addNotification(
  userId: string,
  payload: Omit<Notification, "id" | "userId" | "read" | "createdAt">
): Notification {
  const notification: Notification = {
    ...payload,
    id: `notif-${nextId++}`,
    userId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  const list = store.get(userId) ?? [];
  list.push(notification);
  store.set(userId, list);
  notifyListeners();
  return notification;
}

export function markNotificationRead(userId: string, id: string): void {
  const list = store.get(userId) ?? [];
  const n = list.find((x) => x.id === id);
  if (n) n.read = true;
  notifyListeners();
}

export function markAllNotificationsRead(userId: string): void {
  (store.get(userId) ?? []).forEach((n) => (n.read = true));
  notifyListeners();
}

export function subscribeNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const APPLICANT_USER_ID = "user-applicant";
const TEAM_LEADER_USER_ID = "user-tl";
const INSPECTOR_USER_ID = "user-inspector";
const ADMIN_USER_ID = "user-admin";

/** Seed demo notifications for all roles so each user sees content in the bell on first load. Runs once when store is empty. */
export function seedNotifications(): void {
  if (store.size > 0) return;

  addNotification(APPLICANT_USER_ID, {
    applicationId: "APP-001",
    type: "status_change",
    message: "Application APP-001 status changed to Under Review.",
  });
  addNotification(APPLICANT_USER_ID, {
    applicationId: "APP-003",
    type: "approved",
    message: "Application APP-003 (Hope Medical Center) has been approved.",
  });
  addNotification(APPLICANT_USER_ID, {
    applicationId: "APP-008",
    type: "returned",
    message: "Application APP-008 (Akaki General Hospital) was returned. Remark: Please address compliance findings.",
  });

  addNotification(TEAM_LEADER_USER_ID, {
    applicationId: "APP-006",
    type: "inspection_submitted",
    message: "Inspection submitted for application APP-006 (Lebu Specialty Center). Result: Inspection Submitted.",
  });

  addNotification(INSPECTOR_USER_ID, {
    applicationId: "APP-002",
    type: "assigned",
    message: "Application APP-002 (Mercy General Clinic) has been assigned to you for inspection.",
  });

  addNotification(ADMIN_USER_ID, {
    applicationId: "APP-001",
    type: "status_change",
    message: "Application APP-001 status changed to Submitted.",
  });
  addNotification(ADMIN_USER_ID, {
    applicationId: "APP-003",
    type: "approved",
    message: "Application APP-003 (Hope Medical Center) has been approved.",
  });
}

seedNotifications();
