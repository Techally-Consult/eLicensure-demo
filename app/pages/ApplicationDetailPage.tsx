import { useParams } from "@tanstack/react-router";
import { useApplication } from "~/hooks/useApplication";
import { StatusBadge } from "~/components/StatusBadge";

export function ApplicationDetailPage() {
  const { id } = useParams({ strict: false });
  const { data: application, isLoading, error } = useApplication(id ?? undefined);

  if (isLoading || !id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Application {id ?? "—"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {!id ? "No ID" : "Loading…"}
        </p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Application {id}
        </h1>
        <p className="text-red-600 dark:text-red-400">
          Application not found or failed to load.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {application.id}
        </h1>
        <StatusBadge status={application.status} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {application.licenseType.replace("_", " ")}
        </span>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">
          Summary
        </h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div>
            <dt className="inline text-gray-500 dark:text-gray-400">Facility: </dt>
            <dd className="inline text-gray-900 dark:text-white">
              {application.facilityName}
            </dd>
          </div>
          <div>
            <dt className="inline text-gray-500 dark:text-gray-400">Last updated: </dt>
            <dd className="inline text-gray-900 dark:text-white">
              {new Date(application.lastUpdated).toLocaleString()}
            </dd>
          </div>
          {application.applicant?.name && (
            <div>
              <dt className="inline text-gray-500 dark:text-gray-400">Applicant: </dt>
              <dd className="inline text-gray-900 dark:text-white">
                {application.applicant.name}
              </dd>
            </div>
          )}
        </dl>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Form (read-only) and Timeline tabs will be added in a later step.
      </p>
    </div>
  );
}
