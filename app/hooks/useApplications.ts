import { useQuery } from "@tanstack/react-query";
import { listApplications } from "~/data/mockApi";
import { useAuth } from "~/contexts/AuthContext";

export const applicationsQueryKey = ["applications"] as const;

export function useApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...applicationsQueryKey, user?.role, user?.id],
    queryFn: () => listApplications({ role: user?.role, userId: user?.id }),
  });
}
