import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useApplication } from "~/hooks/useApplication";
import { applicationQueryKey } from "~/hooks/useApplication";
import { applicationsQueryKey } from "~/hooks/useApplications";
import { updateApplicationStatus } from "~/data/mockApi";
import { StatusBadge } from "~/components/StatusBadge";
import { Timeline } from "~/components/Timeline";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { ApplicationStatus, TimelineEvent } from "~/types/application";
import { Eye, Download } from "lucide-react";
import type { ApplicationDocument } from "~/types/application";

type DetailTab = "summary" | "form" | "timeline" | "documents";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Draft",
  "Submitted",
  "Assigned",
  "Under Inspection",
  "Inspection Submitted",
  "Inspection Rejected",
  "Under Review",
  "Approved",
  "Rejected",
];

function sortDocuments(docs: ApplicationDocument[]): ApplicationDocument[] {
  const applicant = docs.filter((d) => d.type === "applicant");
  const acknowledgement = docs.filter((d) => d.type === "acknowledgement");
  const license = docs.filter((d) => d.type === "license_certificate");
  return [...applicant, ...acknowledgement, ...license];
}

function formatDocDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: "short" });
  } catch {
    return iso;
  }
}

export function ApplicationDetailPage() {
  const { id } = useParams({ strict: false });
  const { data: application, isLoading, error } = useApplication(id ?? undefined);
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");
  const queryClient = useQueryClient();

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (!id) return;
    updateApplicationStatus(id, newStatus);
    queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    queryClient.invalidateQueries({ queryKey: applicationQueryKey(id) });
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {application.id}
        </h1>
        <StatusBadge status={application.status} />
        <span className="text-sm text-muted-foreground">
          {application.licenseType.replace("_", " ")}
        </span>
        {id && (
          <Button variant="outline" size="sm" asChild className="ml-auto">
            <Link to="/apply/$id" params={{ id }}>Edit</Link>
          </Button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select
            value={application.status}
            onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTab)}>
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
          <TabsContent value="summary" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Facility</dt>
                <dd className="font-medium text-foreground">
                  {application.facilityName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="font-medium text-foreground">
                  {new Date(application.lastUpdated).toLocaleString()}
                </dd>
              </div>
              {application.applicant?.name && (
                <div>
                  <dt className="text-muted-foreground">Applicant</dt>
                  <dd className="font-medium text-foreground">
                    {application.applicant.name}
                    {application.applicant.email && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        ({application.applicant.email})
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {application.services && application.services.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">Services</dt>
                  <dd className="font-medium text-foreground">
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
            </CardContent>
          </TabsContent>
          <TabsContent value="form" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Form (read-only)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
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
                  {application.applicant.authLetterRef && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Authorization letter reference</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {application.applicant.authLetterRef}
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

            {(application.totalBeds || application.staffingHead?.name) && (
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Capacity &amp; Staffing
                </h3>
                <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                  {application.totalBeds && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Total beds</dt>
                      <dd className="text-gray-900 dark:text-white">{application.totalBeds}</dd>
                    </div>
                  )}
                  {application.staffingHead?.name && (
                    <>
                      <div>
                        <dt className="text-gray-500 dark:text-gray-400">Facility head</dt>
                        <dd className="text-gray-900 dark:text-white">{application.staffingHead.name}</dd>
                      </div>
                      {application.staffingHead.qualification && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Qualification</dt>
                          <dd className="text-gray-900 dark:text-white">{application.staffingHead.qualification}</dd>
                        </div>
                      )}
                      {application.staffingHead.licenseNumber && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">License number</dt>
                          <dd className="text-gray-900 dark:text-white">{application.staffingHead.licenseNumber}</dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
                {application.staffRows && application.staffRows.length > 0 && (
                  <div className="mt-2">
                    <dt className="mb-1 text-gray-500 dark:text-gray-400">Staff</dt>
                    <ul className="space-y-1 text-sm">
                      {application.staffRows.map((r, i) => (
                        <li key={i} className="text-gray-900 dark:text-white">
                          {r.name} — {r.cadre}{r.license ? ` (${r.license})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {application.infrastructureDescription && (
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Infrastructure
                </h3>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {application.infrastructureDescription}
                </p>
              </section>
            )}

            {(application.typeSpecific?.new || application.typeSpecific?.renewal || application.typeSpecific?.additional) && (
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Type-specific
                </h3>
                <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                  {application.typeSpecific?.new && (
                    <>
                      {application.typeSpecific.new.startDate && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Intended start date</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.new.startDate}</dd>
                        </div>
                      )}
                      {application.typeSpecific.new.constructionStatus && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Construction status</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.new.constructionStatus}</dd>
                        </div>
                      )}
                      {application.typeSpecific.new.readyForInspection != null && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Ready for inspection</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.new.readyForInspection ? "Yes" : "No"}</dd>
                        </div>
                      )}
                    </>
                  )}
                  {application.typeSpecific?.renewal && (
                    <>
                      {application.typeSpecific.renewal.licenseNumber && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">License number</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.renewal.licenseNumber}</dd>
                        </div>
                      )}
                      {application.typeSpecific.renewal.issueDate && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Issue date</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.renewal.issueDate}</dd>
                        </div>
                      )}
                      {application.typeSpecific.renewal.expiryDate && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Expiry date</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.renewal.expiryDate}</dd>
                        </div>
                      )}
                      {application.typeSpecific.renewal.changes && (
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500 dark:text-gray-400">Changes</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.renewal.changes}</dd>
                        </div>
                      )}
                      {application.typeSpecific.renewal.lastInspection && (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Last inspection</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.renewal.lastInspection}</dd>
                        </div>
                      )}
                      {application.typeSpecific.renewal.inspectionSummary && (
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500 dark:text-gray-400">Inspection summary</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.renewal.inspectionSummary}</dd>
                        </div>
                      )}
                    </>
                  )}
                  {application.typeSpecific?.additional && (
                    <>
                      {application.typeSpecific.additional.currentServices && (
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500 dark:text-gray-400">Current services</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.additional.currentServices}</dd>
                        </div>
                      )}
                      {application.typeSpecific.additional.newServices && application.typeSpecific.additional.newServices.length > 0 && (
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500 dark:text-gray-400">New services</dt>
                          <dd className="text-gray-900 dark:text-white">
                            <ul className="list-disc pl-4 space-y-1">
                              {application.typeSpecific.additional.newServices.map((s, i) => (
                                <li key={i}>{s.name} — {s.category}, {s.beds} beds. {s.summary}</li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      )}
                      {application.typeSpecific.additional.justification && (
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500 dark:text-gray-400">Justification</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.additional.justification}</dd>
                        </div>
                      )}
                      {application.typeSpecific.additional.impact && (
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500 dark:text-gray-400">Impact</dt>
                          <dd className="text-gray-900 dark:text-white">{application.typeSpecific.additional.impact}</dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </section>
            )}

            {(!application.applicant || !application.facility) &&
              (!application.services || application.services.length === 0) &&
              !application.staffingHead?.name &&
              !application.infrastructureDescription &&
              !application.typeSpecific?.new &&
              !application.typeSpecific?.renewal &&
              !application.typeSpecific?.additional && (
                <p className="text-sm text-muted-foreground">
                  No form data to display.
                </p>
              )}
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="timeline" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Timeline events={timelineEvents} />
            </CardContent>
          </TabsContent>
          <TabsContent value="documents" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
              <p className="text-xs text-muted-foreground">
                Applicant uploads and generated letters (acknowledgement, license certificate)
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {!application.documents || application.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">No.</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Attachment</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">File name</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Uploaded</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortDocuments(application.documents).map((doc, index) => (
                        <tr key={doc.id} className="border-b border-border">
                          <td className="py-3 pr-4 text-muted-foreground">{index + 1}</td>
                          <td className="py-3 pr-4">
                            <span className="font-medium text-foreground">{doc.name}</span>
                            {doc.description && (
                              <span className="block text-xs text-muted-foreground">{doc.description}</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{doc.fileName ?? doc.name}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {formatDocDate(doc.uploadedAt)}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-teal-600 dark:hover:text-teal-400"
                                title="Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                              <a
                                href={doc.url}
                                download={(doc.fileName ?? doc.name).replace(/\s+/g, "_")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-teal-600 dark:hover:text-teal-400"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
