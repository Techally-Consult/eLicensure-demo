import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useApplication } from "~/hooks/useApplication";
import { useAuth } from "~/contexts/AuthContext";
import { setUnderInspection, submitInspection } from "~/data/mockApi";
import { applicationQueryKey } from "~/hooks/useApplication";
import { applicationsQueryKey } from "~/hooks/useApplications";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "~/components/StatusBadge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Eye, Download } from "lucide-react";
import type { ApplicationDocument } from "~/types/application";

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

export function InspectionDetailPage() {
  const { id } = useParams({ strict: false });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: application, isLoading } = useApplication(id ?? undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      user &&
      user.role !== "Inspector" &&
      user.role !== "Admin"
    )
      navigate({ to: "/" });
  }, [user, navigate]);

  const didSetUnderInspection = useRef(false);
  useEffect(() => {
    if (
      !didSetUnderInspection.current &&
      id &&
      application?.status === "Assigned" &&
      application?.assignedTo === user?.id
    ) {
      didSetUnderInspection.current = true;
      setUnderInspection(id);
      queryClient.invalidateQueries({ queryKey: applicationQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    }
  }, [id, application?.status, application?.assignedTo, user?.id, queryClient]);

  const [result, setResult] = useState<"Submitted" | "Rejected">("Submitted");
  const [remark, setRemark] = useState("");

  const handleSubmit = () => {
    if (!id || !user) return;
    submitInspection(id, result, remark, user.id);
    queryClient.invalidateQueries({ queryKey: applicationQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
  };

  if (isLoading || !id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Inspection</h1>
        <p className="text-muted-foreground">
          {!id ? "No ID" : "Loading…"}
        </p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Inspection</h1>
        <p className="text-red-600 dark:text-red-400">Application not found.</p>
      </div>
    );
  }

  if (user && user.role !== "Inspector" && user.role !== "Admin") return null;

  const canSubmit =
    application.assignedTo === user?.id &&
    (application.status === "Assigned" || application.status === "Under Inspection");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">
          Inspection — {application.id}
        </h1>
        <StatusBadge status={application.status} />
        <Link
          to="/applications/$id"
          params={{ id: application.id }}
          className="text-sm text-primary hover:underline"
        >
          View application
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Facility:</span>{" "}
            {application.facilityName}
          </p>
          <p>
            <span className="text-muted-foreground">License type:</span>{" "}
            {application.licenseType.replace("_", " ")}
          </p>
          {application.applicant?.name && (
            <p>
              <span className="text-muted-foreground">Applicant:</span>{" "}
              {application.applicant.name}
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
          <p className="text-xs text-muted-foreground">
            Applicant uploads and generated letters for review
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
      </Card>
      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submit inspection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Result</Label>
              <RadioGroup
                value={result}
                onValueChange={(v) => setResult(v as "Submitted" | "Rejected")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Submitted" id="res-submitted" />
                  <label htmlFor="res-submitted" className="cursor-pointer">
                    Inspection Submitted
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Rejected" id="res-rejected" />
                  <label htmlFor="res-rejected" className="cursor-pointer">
                    Inspection Rejected (return to applicant)
                  </label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Optional remark..."
                rows={3}
              />
            </div>
            <Button onClick={handleSubmit}>Submit inspection</Button>
          </CardContent>
        </Card>
      )}
      {!canSubmit && application.inspection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inspection result</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Result: {application.inspection.result}
              {application.inspection.remark && (
                <> — {application.inspection.remark}</>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
