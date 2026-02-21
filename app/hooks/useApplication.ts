import { useQuery } from "@tanstack/react-query";
import { getApplication } from "~/data/mockApi";

export function applicationQueryKey(id: string) {
  return ["application", id] as const;
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: applicationQueryKey(id ?? ""),
    queryFn: () => getApplication(id!),
    enabled: Boolean(id),
  });
}
