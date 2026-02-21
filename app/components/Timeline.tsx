import type { TimelineEvent } from "~/types/application";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No timeline events yet.
      </p>
    );
  }

  return (
    <ul className="relative space-y-0">
      {events.map((event, i) => (
        <li key={`${event.date}-${event.label}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
          {i < events.length - 1 && (
            <span
              className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
              aria-hidden
            />
          )}
          <span
            className="relative z-10 h-4 w-4 shrink-0 rounded-full border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
            aria-hidden
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {event.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(event.date)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
