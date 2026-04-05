import { currencies } from "@/data/currencies";
import { useWallet } from "@/hooks/useWallet";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AppHeader() {
  const { wallet } = useWallet();
  const navigate = useNavigate();
  const topCurrencies = currencies.filter(c => wallet[c.id] > 0).slice(0, 3);

  return (
    <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <h1 className="font-display font-extrabold text-xl">
          <span className="text-foreground">Fan</span>
          <span className="text-star">.</span>
          <span className="text-foreground">bet</span>
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
          {topCurrencies.map(c => (
            <span key={c.id} className={`flex items-center gap-0.5 text-xs font-display font-bold ${c.textColorClass}`}>
              <span className="text-sm">{c.emoji}</span>
              {wallet[c.id].toLocaleString()}
            </span>
          ))}
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
