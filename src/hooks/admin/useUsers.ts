import { useQuery } from "@tanstack/react-query";
import { listUsers, FN_LIST_USERS, type UserFilters } from "@/lib/db/functions";

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: [FN_LIST_USERS, filters],
    queryFn: () => listUsers(filters),
    staleTime: 30_000,
  });
}
