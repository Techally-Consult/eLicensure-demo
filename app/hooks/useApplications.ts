import { useQuery } from "@tanstack/react-query";
import { listApplications } from "~/data/mockApi";

export const applicationsQueryKey = ["applications"] as const;

export function useApplications() {
  return useQuery({
    queryKey: applicationsQueryKey,
    queryFn: listApplications,
  });
}
