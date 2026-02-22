import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useNotifications } from "~/hooks/useNotifications";
import { Button } from "~/components/ui/button";

type Props = {
  userId: string | undefined;
};

export function NotificationsDropdown({ userId }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications(userId);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  if (!userId) return null;

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-md border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-3 py-2 text-sm ${!n.read ? "bg-muted/50" : ""}`}
                  >
                    <Link
                      to={n.applicationId ? "/applications/$id" : "/"}
                      params={n.applicationId ? { id: n.applicationId } : {}}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                      className="block hover:bg-muted/50"
                    >
                      <p className="font-medium text-foreground">{n.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
