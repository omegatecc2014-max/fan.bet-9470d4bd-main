import React, { createContext, useContext, useState } from "react";
import { UserWallet, initialWalletData } from "@/data/currencies";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface WalletContextType {
  wallet: UserWallet;
  purchasePackage: (currencyId: keyof UserWallet, amount: number, price: number, method: 'pix' | 'cc') => Promise<any>;
  isPurchasing: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<UserWallet>(initialWalletData);
  const [isPurchasing, setIsPurchasing] = useState(false);

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, cpf')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: price,
          currency_id: currencyId,
          description: `Compra de ${amount} ${currencyId}`,
          payer_email: user.email,
          payer_name: profile?.full_name || user.user_metadata?.full_name || user.email || 'Usuário',
          payer_cpf: profile?.cpf,
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

  return (
    <WalletContext.Provider value={{ wallet, purchasePackage, isPurchasing }}>
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
