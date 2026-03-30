import type { RankTier } from "@/data/mockData";
import { rankBorderColors } from "@/data/mockData";
import { User } from "lucide-react";

interface RankAvatarProps {
  src?: string;
  tier: RankTier;
  size?: "sm" | "md" | "lg";
  name?: string;
}

export function RankAvatar({ src, tier, size = "md", name }: RankAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-[3px]",
    lg: "w-20 h-20 border-4",
  };

  return (
    <div className={`rounded-full ${rankBorderColors[tier]} ${sizeClasses[size]} overflow-hidden bg-muted flex items-center justify-center`}>
      {src ? (
        <img src={src} alt={name || "avatar"} className="w-full h-full object-cover" />
      ) : (
        <User className="w-1/2 h-1/2 text-muted-foreground" />
      )}
    </div>
  );
}
