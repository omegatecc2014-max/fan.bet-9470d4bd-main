import type { RankTier } from "@/data/mockData";
import { rankColors } from "@/data/mockData";

interface RankBadgeProps {
  tier: RankTier;
  size?: "sm" | "md";
}

export function RankBadge({ tier, size = "sm" }: RankBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-full font-display font-bold uppercase tracking-wider bg-gradient-to-r ${rankColors[tier]} text-background ${sizeClasses}`}
    >
      {tier}
    </span>
  );
}
