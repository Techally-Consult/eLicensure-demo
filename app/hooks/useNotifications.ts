import { useState, useEffect } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeNotifications,
} from "~/data/mockNotifications";

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState(
    () => (userId ? getNotifications(userId) : [])
  );

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    const refresh = () => setNotifications(getNotifications(userId));
    refresh();
    const unsub = subscribeNotifications(refresh);
    return unsub;
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    if (userId) markNotificationRead(userId, id);
  };

  const markAllRead = () => {
    if (userId) markAllNotificationsRead(userId);
  };

  return { notifications, unreadCount, markRead, markAllRead };
}
