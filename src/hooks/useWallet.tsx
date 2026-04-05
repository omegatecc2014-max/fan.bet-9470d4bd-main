import React, { createContext, useContext, useState } from "react";
import { UserWallet, initialWalletData, type CurrencyType } from "@/data/currencies";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface WithdrawalRequest {
  currencyType: CurrencyType;
  amount: number;
  pixKey: string;
  pixKeyType: "cpf" | "cnpj" | "email" | "phone" | "random";
  recipientName: string;
  recipientBank?: string;
}

interface WalletContextType {
  wallet: UserWallet;
  purchasePackage: (currencyId: keyof UserWallet, amount: number, price: number, method: 'pix' | 'cc') => Promise<any>;
  requestWithdrawal: (request: WithdrawalRequest) => Promise<{ protocol: string; transactionId: string }>;
  isPurchasing: boolean;
  convertToBRL: (currencyType: CurrencyType, amount: number) => { amount: number; rate: number };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const EXCHANGE_RATES: Record<CurrencyType, number> = {
  stars: 0.01,
  diamonds: 0.10,
  gold: 0.50,
  crowns: 2.00,
  unicorns: 10.00,
  chickens: 0.05,
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<UserWallet>(initialWalletData);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const convertToBRL = (currencyType: CurrencyType, amount: number): { amount: number; rate: number } => {
    const rate = EXCHANGE_RATES[currencyType];
    return {
      amount: amount * rate,
      rate: rate
    };
  };

  const purchasePackage = async (
    currencyId: keyof UserWallet, 
    amount: number, 
    price: number, 
    method: 'pix' | 'cc'
  ) => {
    setIsPurchasing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const profile = user.user_metadata || {};

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: price,
          currency_id: currencyId,
          description: `Compra de ${amount} ${currencyId}`,
          payer_email: user.email,
          payer_name: (profile as any)?.full_name || user.email || 'Usuário',
          payer_cpf: (profile as any)?.cpf,
          method: method
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar pagamento.");
      throw error;
    } finally {
      setIsPurchasing(false);
    }
  };

  const requestWithdrawal = async (request: WithdrawalRequest): Promise<{ protocol: string; transactionId: string }> => {
    setIsPurchasing(true);
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const conversion = convertToBRL(request.currencyType, request.amount);

      const { data, error } = await supabase.functions.invoke('request-withdrawal', {
        body: {
          amount: conversion.amount,
          pixKey: request.pixKey,
          pixKeyType: request.pixKeyType,
          recipientName: request.recipientName,
          recipientBank: request.recipientBank,
          convertedCurrency: request.currencyType,
          convertedAmount: request.amount,
          conversionRate: conversion.rate
        }
      });

      if (error) {
        console.error("Withdrawal error:", error);
        throw new Error(error.message || "Erro ao processar solicitação");
      }

      setWallet(prev => ({
        ...prev,
        [request.currencyType]: Math.max(0, prev[request.currencyType] - request.amount)
      }));

      toast.success(`Saque solicitado! Protocolo: ${data.protocol}`);
      return { protocol: data.protocol, transactionId: data.transactionId };
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao solicitar saque.");
      throw e;
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <WalletContext.Provider value={{ wallet, purchasePackage, requestWithdrawal, isPurchasing, convertToBRL }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};