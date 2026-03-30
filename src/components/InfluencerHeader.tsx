import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function InfluencerHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <h1 className="font-display font-extrabold text-xl">
          <span className="text-foreground">Fan</span>
          <span className="text-star">.</span>
          <span className="text-foreground">bet</span>
        </h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-xs font-display font-semibold text-secondary">Criador</span>
        </div>
      </div>
    </header>
  );
}
