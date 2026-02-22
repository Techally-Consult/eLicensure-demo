import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "~/contexts/AuthContext";
import { getMockUsers } from "~/data/mockAuth";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function UsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "Admin") navigate({ to: "/" });
  }, [user, navigate]);

  if (user && user.role !== "Admin") return null;

  const users = getMockUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>
      <p className="text-sm text-muted-foreground">
        Mock users (one per role). Admin only.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All users</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded border border-border px-3 py-2"
              >
                <span className="font-medium">{u.name}</span>
                <span className="text-muted-foreground">{u.email}</span>
                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
