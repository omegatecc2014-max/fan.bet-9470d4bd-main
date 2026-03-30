import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listInfluencers, updateInfluencerStatus,
  FN_LIST_INFLUENCERS
} from "@/lib/db/functions";

export function useInfluencers() {
  return useQuery({
    queryKey: [FN_LIST_INFLUENCERS],
    queryFn: listInfluencers,
    staleTime: 30_000,
  });
}

export function useUpdateInfluencerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, status }: { profileId: string; status: "active" | "suspended" | "banned" | "pending" }) =>
      updateInfluencerStatus(profileId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FN_LIST_INFLUENCERS] }),
  });
}
