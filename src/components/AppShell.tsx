import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { InfluencerHeader } from "@/components/InfluencerHeader";
import { BottomNav } from "@/components/BottomNav";
import { InfluencerBottomNav } from "@/components/InfluencerBottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isInfluencer = location.pathname.startsWith("/influencer");

  useEffect(() => {
    const names = ["João", "Maria", "Pedro", "Ana", "Carlos", "Lucas", "Julia", "Marcos", "Beatriz"];
    
    const initialTimeout = setTimeout(() => {
        const winner = names[Math.floor(Math.random() * names.length)];
        const amount = Math.floor(Math.random() * 500) + 50;
        toast.success("Novo Ganhador! 🏆", {
          description: `${winner} ganhou ${amount} estrelas agora mesmo!`,
          duration: 4000,
        });
    }, 5000);

    const interval = setInterval(() => {
        const winner = names[Math.floor(Math.random() * names.length)];
        const amount = Math.floor(Math.random() * 500) + 50;
        toast.success("Temos um Vencedor! 🏆", {
          description: `${winner} acabou de lucrar ${amount} estrelas!`,
          duration: 4000,
        });
    }, 30000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {isInfluencer ? <InfluencerHeader /> : <AppHeader />}
      {children}
      {isInfluencer ? <InfluencerBottomNav /> : <BottomNav />}
    </div>
  );
}
