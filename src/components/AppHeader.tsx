import { currencies } from "@/data/currencies";
import { Bell } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

export function AppHeader() {
  const { wallet } = useWallet();
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
          {topCurrencies.map(c => (
            <span key={c.id} className={`flex items-center gap-0.5 text-xs font-display font-bold ${c.textColorClass}`}>
              <span className="text-sm">{c.emoji}</span>
              {wallet[c.id].toLocaleString()}
            </span>
          ))}
          <button className="relative text-muted-foreground ml-1">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
          </button>
        </div>
      </div>
    </header>
  );
}
