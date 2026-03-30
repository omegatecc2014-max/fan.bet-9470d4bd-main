import { currentUser } from "@/data/mockData";
import { RankAvatar } from "@/components/RankAvatar";
import { RankBadge } from "@/components/RankBadge";
import { StarBalance } from "@/components/StarBalance";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Settings, ChevronRight, LogOut, Shield, HelpCircle } from "lucide-react";

const stats = [
  { label: "Total de Apostas", value: currentUser.totalBets },
  { label: "Vitórias", value: currentUser.wins },
  { label: "Taxa de Acerto", value: `${Math.round((currentUser.wins / currentUser.totalBets) * 100)}%` },
];

const menuItems = [
  { icon: Settings, label: "Configurações" },
  { icon: Shield, label: "Privacidade e Segurança" },
  { icon: HelpCircle, label: "Central de Ajuda" },
  { icon: LogOut, label: "Sair" },
];

export default function ProfilePage() {
  const { signOut } = useAuth();
  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <RankAvatar tier={currentUser.rank} size="lg" name={currentUser.name} />
        <h2 className="font-display font-bold text-xl text-foreground mt-3">{currentUser.name}</h2>
        <p className="text-muted-foreground text-sm font-body">{currentUser.username}</p>
        <div className="flex items-center gap-3 mt-2">
          <RankBadge tier={currentUser.rank} size="md" />
          <StarBalance amount={currentUser.stars} size="sm" />
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="gradient-card rounded-xl border border-border p-4 text-center"
          >
            <p className="font-display font-bold text-xl text-foreground">{stat.value}</p>
            <p className="text-muted-foreground text-xs font-body mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-1">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            onClick={item.label === "Sair" ? signOut : undefined}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-left font-body text-foreground text-sm">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
