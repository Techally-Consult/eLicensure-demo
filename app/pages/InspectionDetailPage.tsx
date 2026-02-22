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
