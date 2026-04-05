import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Transaction } from "@/lib/database.types";
import { FN_LIST_TRANSACTIONS, FN_APPROVE_TRANSACTION } from "@/lib/db/functions";

interface TransactionFilters {
  status?: string;
  page?: number;
  pageSize?: number;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "TXN-8821", created_at: new Date(Date.now()-120000).toISOString(),   profile_id:"u1",profile_name:"Lucas Ferreira", profile_avatar:"LF",type:"deposit",   method:"PIX",    amount:250,   status:"success"    },
  { id: "TXN-8820", created_at: new Date(Date.now()-480000).toISOString(),   profile_id:"u2",profile_name:"Ana Souza",      profile_avatar:"AS",type:"withdrawal",method:"PIX",    amount:1200,  status:"pending"    },
  { id: "TXN-8819", created_at: new Date(Date.now()-900000).toISOString(),   profile_id:"u3",profile_name:"João Pedro",     profile_avatar:"JP",type:"deposit",   method:"Cartão", amount:100,  status:"failed"     },
  { id: "TXN-8818", created_at: new Date(Date.now()-1320000).toISOString(),  profile_id:"u4",profile_name:"Mariana Castro", profile_avatar:"MC",type:"deposit",   method:"PIX",    amount:500,  status:"success"    },
  { id: "TXN-8817", created_at: new Date(Date.now()-2280000).toISOString(),  profile_id:"u5",profile_name:"Rafael Oliveira",profile_avatar:"RO",type:"withdrawal",method:"TED",    amount:3200,  status:"success"    },
  { id: "TXN-8816", created_at: new Date(Date.now()-3600000).toISOString(),  profile_id:"u6",profile_name:"Fernanda Lima",  profile_avatar:"FL",type:"deposit",   method:"PIX",    amount:75,    status:"success"    },
  { id: "TXN-8815", created_at: new Date(Date.now()-7200000).toISOString(),  profile_id:"u7",profile_name:"Bruno Teixeira", profile_avatar:"BT",type:"deposit",   method:"Cartão", amount:200,  status:"chargeback" },
  { id: "TXN-8814", created_at: new Date(Date.now()-10800000).toISOString(), profile_id:"u8",profile_name:"Carla Mendes",   profile_avatar:"CM",type:"withdrawal",method:"PIX",    amount:430,  status:"pending"    },
];

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [FN_LIST_TRANSACTIONS, filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("Using mock transactions");
        if (filters.status && filters.status !== "all") {
          return MOCK_TRANSACTIONS.filter(t => t.status === filters.status);
        }
        return MOCK_TRANSACTIONS;
      }

      return (data as Transaction[]) || MOCK_TRANSACTIONS;
    },
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

export function useApproveTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          transactionId: id,
          action: "approve"
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FN_LIST_TRANSACTIONS] });
    },
  });
}

export function useRejectTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          transactionId: id,
          action: "reject",
          adminNotes: reason
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FN_LIST_TRANSACTIONS] });
    },
  });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      userId, 
      title, 
      message, 
      type,
      transactionId 
    }: { 
      userId: string; 
      title: string; 
      message: string; 
      type?: "info" | "success" | "warning" | "error";
      transactionId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-user-notification', {
        body: {
          userId,
          title,
          message,
          type: type || "info",
          transactionId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_notifications"] });
    },
  });
}