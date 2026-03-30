import { useQuery } from "@tanstack/react-query";
import { getUserContentReports, FN_GET_USER_REPORTS } from "@/lib/db/functions";

export function useUserModeration(name: string) {
  return useQuery({
    queryKey: [FN_GET_USER_REPORTS, name],
    queryFn: () => getUserContentReports(name),
    enabled: !!name,
  });
}
