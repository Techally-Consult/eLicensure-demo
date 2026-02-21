import { Link } from "@tanstack/react-router";
import { useApplications } from "~/hooks/useApplications";
import { StatusBadge } from "~/components/StatusBadge";

export function DashboardPage() {
  const { data: applications, isLoading, error } = useApplications();

  const inProgress =
    applications?.filter(
      (a) => a.status === "Draft" || a.status === "Under Review"
    ).length ?? 0;
  const submitted =
    applications?.filter((a) => a.status === "Submitted").length ?? 0;
  const approved =
    applications?.filter((a) => a.status === "Approved").length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Applications in progress
          </p>
          <p className="text-2xl font-semibold">
            {isLoading ? "—" : inProgress}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
          <p className="text-2xl font-semibold">
            {isLoading ? "—" : submitted}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
          <p className="text-2xl font-semibold">
            {isLoading ? "—" : approved}
          </p>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load applications.
        </p>
      )}
      {applications && applications.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <h2 className="border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 dark:border-gray-800 dark:text-white">
            Recent applications
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {applications.slice(0, 5).map((app) => (
              <li key={app.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {app.facilityName}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {app.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} />
                  <Link
                    to="/applications/$id"
                    params={{ id: app.id }}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <Link
          to="/apply"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start New Application
        </Link>
      </div>
    </div>
  );
}
