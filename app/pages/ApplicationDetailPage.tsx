import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useApplication } from "~/hooks/useApplication";
import { StatusBadge } from "~/components/StatusBadge";
import { Timeline } from "~/components/Timeline";
import type { TimelineEvent } from "~/types/application";

type DetailTab = "summary" | "form" | "timeline";

export function ApplicationDetailPage() {
  const { id } = useParams({ strict: false });
  const { data: application, isLoading, error } = useApplication(id ?? undefined);
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");

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

  const timelineEvents: TimelineEvent[] =
    application.timeline && application.timeline.length > 0
      ? application.timeline
      : [
          { date: application.lastUpdated, label: "Created" },
          { date: application.lastUpdated, label: application.status },
        ];

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "form", label: "Form" },
    { id: "timeline", label: "Timeline" },
  ];

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

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-4" aria-label="Tabs">
          {tabs.map(({ id: tabId, label }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tabId
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        {activeTab === "summary" && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              Summary
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Facility</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {application.facilityName}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Last updated</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {new Date(application.lastUpdated).toLocaleString()}
                </dd>
              </div>
              {application.applicant?.name && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Applicant</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {application.applicant.name}
                    {application.applicant.email && (
                      <span className="font-normal text-gray-500 dark:text-gray-400">
                        {" "}
                        ({application.applicant.email})
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {application.services && application.services.length > 0 && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Services</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {application.services
                      .map(
                        (s) =>
                          `${s.name}${s.level ? ` (${s.level})` : ""}${s.bedCapacity != null ? `, ${s.bedCapacity} beds` : ""}`
                      )
                      .join("; ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {activeTab === "form" && (
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              Form (read-only)
            </h2>

            {application.applicant && (
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Applicant
                </h3>
                <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Name</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {application.applicant.name}
                    </dd>
                  </div>
                  {application.applicant.idType && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">ID type</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {application.applicant.idType}
                      </dd>
                    </div>
                  )}
                  {application.applicant.idNumber && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">ID number</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {application.applicant.idNumber}
                      </dd>
                    </div>
                  )}
                  {application.applicant.phone && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {application.applicant.phone}
                      </dd>
                    </div>
                  )}
                  {application.applicant.email && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {application.applicant.email}
                      </dd>
                    </div>
                  )}
                  {application.applicant.role && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Role</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {application.applicant.role}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Facility
              </h3>
              <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Name</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {application.facilityName}
                  </dd>
                </div>
                {application.facility?.type && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {application.facility.type}
                    </dd>
                  </div>
                )}
                {application.facility?.ownershipType && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Ownership</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {application.facility.ownershipType}
                    </dd>
                  </div>
                )}
                {application.facility?.region && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Region</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {application.facility.region}
                    </dd>
                  </div>
                )}
                {application.facility?.woreda && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Woreda</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {application.facility.woreda}
                    </dd>
                  </div>
                )}
                {application.facility?.licenseNumber && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">License number</dt>
                    <dd className="text-gray-900 dark:text-white">
                      {application.facility.licenseNumber}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {application.services && application.services.length > 0 && (
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Services
                </h3>
                <ul className="space-y-2 text-sm">
                  {application.services.map((s, i) => (
                    <li
                      key={i}
                      className="flex flex-wrap items-baseline gap-2 text-gray-900 dark:text-white"
                    >
                      <span className="font-medium">{s.name}</span>
                      {s.level && (
                        <span className="text-gray-500 dark:text-gray-400">
                          Level: {s.level}
                        </span>
                      )}
                      {s.bedCapacity != null && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {s.bedCapacity} beds
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(!application.applicant || !application.facility) &&
              (!application.services || application.services.length === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No form data to display.
                </p>
              )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              Timeline
            </h2>
            <Timeline events={timelineEvents} />
          </div>
        )}
      </div>
    </div>
  );
}
