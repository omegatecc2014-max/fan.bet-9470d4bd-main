import { useQuery } from "@tanstack/react-query";
import { getAdminStats, FN_GET_ADMIN_STATS } from "@/lib/db/functions";

export function useAdminStats() {
  return useQuery({
    queryKey: [FN_GET_ADMIN_STATS],
    queryFn: getAdminStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
