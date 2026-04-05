import type { HintCard } from "@/data/mockData";
import { motion } from "framer-motion";
import { Clock, Heart, UserPlus, UserCheck, MapPin, Share2 } from "lucide-react";
import { useState } from "react";
import { RankAvatar } from "./RankAvatar";
import { UserProfileModal } from "./UserProfileModal";
import { toast } from "sonner";

interface HintFeedCardProps {
  hint: HintCard;
  onPredict: (hint: HintCard) => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  isOwner?: boolean;
}

const mockUserRankData = {
  id: "",
  name: "",
  avatar: "",
  avatarInitials: "",
  tier: "gold" as const,
  totalBets: 0,
  wins: 0,
  winRate: 0,
  rank: 0,
  followers: 0,
  following: 0,
  accuracy: 0,
  joinedAt: "",
  bio: "",
};

export function HintFeedCard({ hint, onPredict, isFollowing, onToggleFollow, isOwner }: HintFeedCardProps) {
  const [liked, setLiked] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const userData = {
    ...mockUserRankData,
    id: hint.influencer.id,
    name: hint.influencer.name,
    avatar: hint.influencer.avatar,
    avatarInitials: hint.influencer.name.split(" ").map((n) => n[0]).join("").substring(0, 2),
    tier: (["gold", "silver", "bronze", "platinum", "diamond"] as const)[Math.floor(Math.random() * 5)],
    totalBets: Math.floor(Math.random() * 200) + 50,
    wins: Math.floor(Math.random() * 100) + 20,
    winRate: Math.floor(Math.random() * 30) + 50,
    rank: Math.floor(Math.random() * 100) + 1,
    followers: Math.floor(Math.random() * 5000) + 100,
    following: Math.floor(Math.random() * 500) + 50,
    accuracy: Math.floor(Math.random() * 20) + 60,
    joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    bio: `Apaixonado por ${hint.categories[0] || "esportes"} e análises.`,
    isFollowing: isFollowing,
  };

  const handleShare = () => {
    const shareText = `Olha essa dica top do ${hint.influencer.name} no Fan.bet! 🎯\n\n"${hint.hintText}"\n\n🤞`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, "_blank");
    toast.success("Dica compartilhada!");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-card rounded-xl overflow-hidden border border-border"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-2">
          <button 
            onClick={() => setShowUserModal(true)}
            className="hover:opacity-80 transition-opacity"
          >
            <RankAvatar src={hint.influencer.avatar} tier="gold" size="sm" name={hint.influencer.name} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setShowUserModal(true)}
                className="font-display font-semibold text-foreground text-sm truncate hover:text-star transition-colors"
              >
                {hint.influencer.name}
              </button>
              {hint.influencer.verified && (
                <span className="text-secondary text-xs">✓</span>
              )}
            </div>
            <span className="text-muted-foreground text-xs">{hint.postedAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {!isOwner && onToggleFollow && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggleFollow}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-display font-semibold transition-all ${
                  isFollowing
                    ? "bg-muted text-muted-foreground"
                    : "gradient-star text-primary-foreground glow-star"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    <span>Seguindo</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Seguir</span>
                  </>
                )}
              </motion.button>
            )}
            {isOwner && (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-display font-bold bg-star/10 text-star border border-star/20">
                MEU POST
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-accent">
              <Clock className="w-3 h-3" />
              <span className="font-body">Aberto</span>
            </div>
          </div>
        </div>

        {/* Hint Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img src={hint.hintImage} alt="Dica" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="font-body text-foreground text-sm leading-relaxed">{hint.hintText}</p>
          </div>
        </div>

        {/* Categories & Location */}
        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          {hint.location && (
            <span className="flex items-center gap-1 text-[11px] font-body px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <MapPin className="w-3 h-3" />
              Localização Anexada
            </span>
          )}
          {hint.categories.map((cat) => (
            <span key={cat} className="text-[11px] font-body px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {cat}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setLiked(!liked)} className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-destructive text-destructive" : ""}`} />
          </button>
          <motion.button
            whileTap={isOwner ? {} : { scale: 0.95 }}
            onClick={() => !isOwner && onPredict(hint)}
            disabled={isOwner}
            className={`font-display font-bold text-sm px-6 py-2.5 rounded-full transition-all ${
              isOwner 
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70" 
                : "gradient-star text-primary-foreground glow-star"
            }`}
          >
            {isOwner ? "Sua Dica" : "⭐ Fazer Previsão"}
          </motion.button>
        </div>
      </motion.div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={userData}
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onToggleFollow={onToggleFollow}
      />
    </>
  );
}