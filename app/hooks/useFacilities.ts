import { useQuery } from "@tanstack/react-query";
import { listFacilities } from "~/data/mockApi";

export const facilitiesQueryKey = ["facilities"] as const;

export function useFacilities() {
  return useQuery({
    queryKey: facilitiesQueryKey,
    queryFn: listFacilities,
  });
}
