import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useApplications } from "~/hooks/useApplications";
import { useAuth } from "~/contexts/AuthContext";
import { StatusBadge } from "~/components/StatusBadge";

export function InspectionListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applications, isLoading } = useApplications();

  useEffect(() => {
    if (
      user &&
      user.role !== "Inspector" &&
      user.role !== "Admin"
    )
      navigate({ to: "/" });
  }, [user, navigate]);

  if (user && user.role !== "Inspector" && user.role !== "Admin") return null;

  const myAssigned =
    applications?.filter(
      (a) =>
        a.assignedTo === user?.id &&
        ["Assigned", "Under Inspection", "Inspection Submitted", "Inspection Rejected"].includes(
          a.status
        )
    ) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Inspection</h1>
      <p className="text-sm text-muted-foreground">
        Applications assigned to you. Open to conduct inspection and submit
        result.
      </p>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : myAssigned.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No applications assigned to you.
        </p>
      ) : (
        <ul className="space-y-2">
          {myAssigned.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Link
                  to="/inspection/$id"
                  params={{ id: a.id }}
                  className="font-medium text-primary hover:underline"
                >
                  {a.id}
                </Link>
                <span className="text-muted-foreground">{a.facilityName}</span>
                <StatusBadge status={a.status} />
              </div>
              <Link to="/inspection/$id" params={{ id: a.id }}>
                <span className="text-sm text-primary hover:underline">
                  {a.status === "Assigned" || a.status === "Under Inspection"
                    ? "Start / Submit inspection"
                    : "View"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
