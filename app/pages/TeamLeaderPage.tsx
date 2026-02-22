import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useApplications } from "~/hooks/useApplications";
import { useAuth } from "~/contexts/AuthContext";
import { getUsersByRole } from "~/data/mockAuth";
import {
  assignApplication,
  approveLicense,
  returnToApplicant,
} from "~/data/mockApi";
import { applicationsQueryKey } from "~/hooks/useApplications";
import { applicationQueryKey } from "~/hooks/useApplication";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "~/components/StatusBadge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Link } from "@tanstack/react-router";

export function TeamLeaderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applications, isLoading } = useApplications();
  const queryClient = useQueryClient();
  const inspectors = getUsersByRole("Inspector");

  useEffect(() => {
    if (user && user.role !== "Team Leader" && user.role !== "Admin")
      navigate({ to: "/" });
  }, [user, navigate]);

  if (user && user.role !== "Team Leader" && user.role !== "Admin") return null;
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedInspector, setSelectedInspector] = useState<string>("");
  const [returningId, setReturningId] = useState<string | null>(null);
  const [returnRemark, setReturnRemark] = useState("");

  const submitted = applications?.filter((a) => a.status === "Submitted") ?? [];
  const inspected =
    applications?.filter(
      (a) =>
        a.status === "Inspection Submitted" || a.status === "Inspection Rejected"
    ) ?? [];

  const handleAssign = (appId: string) => {
    if (!selectedInspector) return;
    assignApplication(appId, selectedInspector);
    queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    queryClient.invalidateQueries({ queryKey: applicationQueryKey(appId) });
    setAssigningId(null);
    setSelectedInspector("");
  };

  const handleApprove = (appId: string) => {
    approveLicense(appId);
    queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    queryClient.invalidateQueries({ queryKey: applicationQueryKey(appId) });
  };

  const handleReturn = (appId: string) => {
    returnToApplicant(appId, returnRemark);
    queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    queryClient.invalidateQueries({ queryKey: applicationQueryKey(appId) });
    setReturningId(null);
    setReturnRemark("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Team Leader</h1>
      <p className="text-sm text-muted-foreground">
        Assign applications to inspectors; review inspections and approve or
        return to applicant.
      </p>
      <Tabs defaultValue="assign">
        <TabsList>
          <TabsTrigger value="assign">Assign to inspector</TabsTrigger>
          <TabsTrigger value="review">Review inspection</TabsTrigger>
        </TabsList>
        <TabsContent value="assign" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Applications submitted (to assign)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : submitted.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications in Submitted status.
                </p>
              ) : (
                <ul className="space-y-2">
                  {submitted.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          to="/applications/$id"
                          params={{ id: a.id }}
                          className="font-medium text-primary hover:underline"
                        >
                          {a.id}
                        </Link>
                        <span className="text-muted-foreground">
                          {a.facilityName}
                        </span>
                        <StatusBadge status={a.status} />
                      </div>
                      {assigningId === a.id ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedInspector}
                            onValueChange={setSelectedInspector}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select inspector" />
                            </SelectTrigger>
                            <SelectContent>
                              {inspectors.map((i) => (
                                <SelectItem key={i.id} value={i.id}>
                                  {i.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => handleAssign(a.id)}
                            disabled={!selectedInspector}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAssigningId(null);
                              setSelectedInspector("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setAssigningId(a.id)}
                        >
                          Assign
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="review" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Inspected applications (review)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : inspected.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications with inspection submitted.
                </p>
              ) : (
                <ul className="space-y-3">
                  {inspected.map((a) => (
                    <li
                      key={a.id}
                      className="rounded border border-border p-3 space-y-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/applications/$id"
                          params={{ id: a.id }}
                          className="font-medium text-primary hover:underline"
                        >
                          {a.id}
                        </Link>
                        <span className="text-muted-foreground">
                          {a.facilityName}
                        </span>
                        <StatusBadge status={a.status} />
                      </div>
                      {a.inspection && (
                        <div className="text-sm text-muted-foreground">
                          Result: {a.inspection.result};{" "}
                          {a.inspection.remark && `Remark: ${a.inspection.remark}`}
                        </div>
                      )}
                      {returningId === a.id ? (
                        <div className="space-y-2 pt-2">
                          <Label>Remark (return to applicant)</Label>
                          <Textarea
                            value={returnRemark}
                            onChange={(e) => setReturnRemark(e.target.value)}
                            placeholder="Reason for return..."
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReturn(a.id)}
                            >
                              Return to applicant
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReturningId(null);
                                setReturnRemark("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => handleApprove(a.id)}>
                            Approve license
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReturningId(a.id)}
                          >
                            Return to applicant
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
