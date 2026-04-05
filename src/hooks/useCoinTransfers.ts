import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CoinTransfer {
  id: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  recipient_id: string;
  recipient_name: string;
  recipient_avatar: string;
  currency_type: string;
  amount: number;
  status: string;
  message?: string;
  protocol?: string;
  admin_notes?: string;
  admin_approved_at?: string;
  recipient_accepted_at?: string;
  recipient_rejected_at?: string;
  recipient_notes?: string;
}

const MOCK_TRANSFERS: CoinTransfer[] = [];

export function useCoinTransfers() {
  return useQuery({
    queryKey: ["coin_transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coin_transfers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("Using mock transfers");
        return MOCK_TRANSFERS;
      }

      return (data as CoinTransfer[]) || MOCK_TRANSFERS;
    },
  });
}

export function useRequestCoinTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      recipientId: string;
      recipientName: string;
      recipientAvatar: string;
      currencyType: string;
      amount: number;
      message?: string;
    }) => {
      const { data: result, error } = await supabase.functions.invoke("request-coin-transfer", {
        body: data,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coin_transfers"] });
    },
  });
}

export function useAdminProcessCoinTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { transferId: string; action: "approve" | "reject"; adminNotes?: string }) => {
      const { data: result, error } = await supabase.functions.invoke("process-coin-transfer", {
        body: data,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coin_transfers"] });
    },
  });
}

export function useRespondCoinTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { transferId: string; action: "accept" | "reject"; recipientNotes?: string }) => {
      const { data: result, error } = await supabase.functions.invoke("respond-coin-transfer", {
        body: data,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coin_transfers"] });
    },
  });
}