import { Home, PenSquare, ClipboardCheck, ArrowLeftRight } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/influencer", icon: Home, label: "Painel" },
  { to: "/influencer/post-hint", icon: PenSquare, label: "Postar Dica" },
  { to: "/influencer/questionnaire", icon: ClipboardCheck, label: "Confirmar" },
];

export function InfluencerBottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/influencer"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? "text-star" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-display font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground"
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] font-display font-medium">Visão Fã</span>
        </button>
      </div>
    </nav>
  );
}
