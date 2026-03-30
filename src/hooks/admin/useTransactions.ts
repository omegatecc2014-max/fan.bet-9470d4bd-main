import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listTransactions, approveTransaction,
  FN_LIST_TRANSACTIONS, type TransactionFilters
} from "@/lib/db/functions";

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [FN_LIST_TRANSACTIONS, filters],
    queryFn: () => listTransactions(filters),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

export function useApproveTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: [FN_LIST_TRANSACTIONS] }),
  });
}
