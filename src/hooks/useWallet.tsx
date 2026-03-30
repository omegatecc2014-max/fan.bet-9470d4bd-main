import React, { createContext, useContext, useState } from "react";
import { UserWallet, initialWalletData } from "@/data/currencies";
import { toast } from "sonner";

interface WalletContextType {
  wallet: UserWallet;
  purchasePackage: (currencyId: keyof UserWallet, amount: number) => Promise<void>;
  isPurchasing: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<UserWallet>(initialWalletData);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchasePackage = async (currencyId: keyof UserWallet, amount: number) => {
    setIsPurchasing(true);
    try {
      // Simulate network request for purchase processing
      await new Promise(resolve => setTimeout(resolve, 800));
      setWallet(prev => ({
        ...prev,
        [currencyId]: prev[currencyId] + amount
      }));
      toast.success(`Compra efetuada com sucesso! +${amount}`);
    } catch (error) {
      toast.error("Erro ao efetuar compra.");
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
