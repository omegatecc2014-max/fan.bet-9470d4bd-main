import { useQuery } from "@tanstack/react-query";
import { getUserHistory, FN_GET_USER_HISTORY } from "@/lib/db/functions";

export function useUserHistory(email: string) {
  return useQuery({
    queryKey: [FN_GET_USER_HISTORY, email],
    queryFn: () => getUserHistory(email),
    enabled: !!email,
  });
}
