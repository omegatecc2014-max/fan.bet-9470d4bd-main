import { Home, Trophy, Wallet, User, Star } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/rankings", icon: Trophy, label: "Ranking" },
  { to: "/wallet", icon: Wallet, label: "Carteira" },
  { to: "/influencer", icon: Star, label: "Influencer" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
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
      </div>
    </nav>
  );
}
