import { Link } from "@tanstack/react-router";
import { useApplications } from "~/hooks/useApplications";
import { useAuth } from "~/contexts/AuthContext";
import { StatusBadge } from "~/components/StatusBadge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ApplicationsByStatusChart } from "~/components/ApplicationsByStatusChart";
import { ApplicationsOverTimeChart } from "~/components/ApplicationsOverTimeChart";
import type { UserRole } from "~/types/auth";

function getDashboardSubtitle(role: UserRole | undefined): string {
  switch (role) {
    case "Applicant":
      return "Overview of your facility license applications. Track status, view recent activity, and start a new application.";
    case "Inspector":
      return "Applications assigned to you for inspection. View status and open inspections.";
    case "Team Leader":
      return "Overview of all applications. Assign inspections and review progress.";
    case "Admin":
      return "Overview of all applications. Track status and manage the system.";
    default:
      return "Overview of your facility license applications. Track status, view recent activity, and start a new application.";
  }
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: applications, isLoading, error } = useApplications();
  const role = user?.role;

  const inProgress =
    applications?.filter(
      (a) => a.status === "Draft" || a.status === "Under Review"
    ).length ?? 0;
  const submitted =
    applications?.filter((a) => a.status === "Submitted").length ?? 0;
  const approved =
    applications?.filter((a) => a.status === "Approved").length ?? 0;
  const assigned =
    applications?.filter((a) => a.status === "Assigned").length ?? 0;
  const underInspection =
    applications?.filter((a) => a.status === "Under Inspection").length ?? 0;
  const inspectionDone =
    applications?.filter(
      (a) =>
        a.status === "Inspection Submitted" || a.status === "Inspection Rejected"
    ).length ?? 0;

  const isInspector = role === "Inspector";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getDashboardSubtitle(role)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {isInspector ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assigned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{isLoading ? "—" : assigned}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Awaiting start
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Under inspection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{isLoading ? "—" : underInspection}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  In progress
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Inspection done
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{isLoading ? "—" : inspectionDone}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted or rejected
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Applications in progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{isLoading ? "—" : inProgress}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Draft + Under review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{isLoading ? "—" : submitted}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{isLoading ? "—" : approved}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Licensed
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications by status</CardTitle>
            <p className="text-xs text-muted-foreground">
              Count of applications in each status
            </p>
          </CardHeader>
          <CardContent>
            <ApplicationsByStatusChart applications={applications} isLoading={isLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications over time</CardTitle>
            <p className="text-xs text-muted-foreground">
              Applications submitted per week
            </p>
          </CardHeader>
          <CardContent>
            <ApplicationsOverTimeChart applications={applications} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {role === "Applicant" || role === "Admin" ? (
            <Button asChild>
              <Link to="/apply">Start New Application</Link>
            </Button>
          ) : role === "Inspector" ? (
            <Button asChild>
              <Link to="/inspection">View my inspections</Link>
            </Button>
          ) : role === "Team Leader" ? (
            <Button asChild>
              <Link to="/team-leader">Assign inspections</Link>
            </Button>
          ) : null}
        </div>
        {error && (
          <p className="text-sm text-destructive">Failed to load applications.</p>
        )}
      </div>

      {applications && applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent applications</CardTitle>
            <p className="text-xs text-muted-foreground">
              Latest updates — click View to see details
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {applications.slice(0, 8).map((app) => (
                <li key={app.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium text-foreground">
                      {app.facilityName}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {app.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} />
                    <Button variant="link" size="sm" asChild>
                      <Link to="/applications/$id" params={{ id: app.id }}>
                        View
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
