import { influencers } from "@/data/mockData";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface StoryRowProps {
  followingIds: string[];
  onToggleFollow: (id: string) => void;
}

export function StoryRow({ followingIds, onToggleFollow }: StoryRowProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      {influencers.map((inf, i) => {
        const isFollowing = followingIds.includes(inf.id);
        const hasNew = inf.hasNewStory;

        return (
          <motion.div
            key={inf.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
            className="flex flex-col items-center gap-1.5 min-w-[72px]"
          >
            <button
              onClick={() => onToggleFollow(inf.id)}
              className="relative group"
            >
              <div
                className={`w-16 h-16 rounded-full p-[2.5px] transition-all ${
                  hasNew
                    ? "bg-gradient-to-br from-star via-star-glow to-secondary animate-pulse-glow"
                    : "bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/10"
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-[2.5px] border-background">
                  <img
                    src={inf.avatar}
                    alt={inf.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {hasNew && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-background" />
              )}

              {!isFollowing && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full gradient-star flex items-center justify-center border-2 border-background">
                  <Plus className="w-3 h-3 text-primary-foreground" />
                </span>
              )}
            </button>

            <div className="text-center w-[68px]">
              <span className="text-[10px] font-display font-medium text-foreground/80 truncate block leading-tight">
                {inf.name.split(" ")[0]}
              </span>
              {isFollowing && (
                <span className="text-[8px] font-body text-star">Seguindo</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
