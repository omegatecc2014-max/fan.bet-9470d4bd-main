import { useQuery } from "@tanstack/react-query";
import { getAnalytics, FN_GET_ANALYTICS } from "@/lib/db/functions";

export function useAnalytics() {
  return useQuery({
    queryKey: [FN_GET_ANALYTICS],
    queryFn: getAnalytics,
    staleTime: 300_000, // Analytics data is expensive — 5min cache
  });
}
