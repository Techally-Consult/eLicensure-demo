type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected";

const styles: Record<ApplicationStatus, string> = {
  Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  Submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  "Under Review": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const defaultStyle =
  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

export function StatusBadge({ status }: { status: string }) {
  const className =
    status in styles ? styles[status as ApplicationStatus] : defaultStyle;
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {status}
    </span>
  );
}
