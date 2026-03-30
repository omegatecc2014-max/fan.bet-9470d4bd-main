import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listContentReports, approveContent, removeContent,
  FN_LIST_CONTENT_REPORTS
} from "@/lib/db/functions";

export function useModerationQueue(statusFilter?: string) {
  return useQuery({
    queryKey: [FN_LIST_CONTENT_REPORTS, statusFilter ?? "all"],
    queryFn: () => listContentReports(statusFilter),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

export function useApproveContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveContent,
    onSuccess: () => qc.invalidateQueries({ queryKey: [FN_LIST_CONTENT_REPORTS] }),
  });
}

export function useRemoveContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeContent,
    onSuccess: () => qc.invalidateQueries({ queryKey: [FN_LIST_CONTENT_REPORTS] }),
  });
}
