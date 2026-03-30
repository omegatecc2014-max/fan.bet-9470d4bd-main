import { rankings } from "@/data/mockData";
import { RankAvatar } from "@/components/RankAvatar";
import { RankBadge } from "@/components/RankBadge";
import { StarBalance } from "@/components/StarBalance";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

export default function RankingsPage() {
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-6">Classificação</h2>

      {/* Pódio Top 3 */}
      <div className="flex items-end justify-center gap-3 mb-8">
        {[top3[1], top3[0], top3[2]].map((entry, i) => {
          const isFirst = i === 1;
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex flex-col items-center ${isFirst ? "mb-4" : ""}`}
            >
              {isFirst && <Crown className="w-6 h-6 text-star mb-1 animate-pulse-glow" />}
              <RankAvatar tier={entry.tier} size={isFirst ? "lg" : "md"} name={entry.user.name} />
              <span className="font-display font-bold text-foreground text-sm mt-2">{entry.user.name}</span>
              <StarBalance amount={entry.stars} size="sm" />
              <RankBadge tier={entry.tier} size="sm" />
            </motion.div>
          );
        })}
      </div>

      {/* Restante do ranking */}
      <div className="space-y-2">
        {rest.map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
          >
            <span className="font-display font-bold text-muted-foreground w-6 text-center text-sm">#{entry.rank}</span>
            <RankAvatar tier={entry.tier} size="sm" name={entry.user.name} />
            <div className="flex-1 min-w-0">
              <span className="font-display font-semibold text-foreground text-sm block truncate">{entry.user.name}</span>
              <span className="text-muted-foreground text-xs font-body">{entry.winRate}% taxa de acerto</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StarBalance amount={entry.stars} size="sm" />
              <RankBadge tier={entry.tier} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
