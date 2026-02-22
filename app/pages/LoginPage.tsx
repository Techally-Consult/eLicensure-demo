import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "~/contexts/AuthContext";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import type { UserRole } from "~/types/auth";

const ROLES: UserRole[] = ["Admin", "Applicant", "Team Leader", "Inspector"];

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    if (selectedRole) {
      login(selectedRole);
      navigate({ to: "/" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">eLicensure Demo</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Select a role to sign in (mock)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as UserRole)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Choose role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={!selectedRole}
          >
            Log in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
