import { X, Trophy, Star, TrendingUp, Calendar, Award, Users, MessageCircle, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface UserRankData {
  id: string;
  name: string;
  avatar: string;
  avatarInitials: string;
  tier: "gold" | "silver" | "bronze" | "platinum" | "diamond";
  totalBets: number;
  wins: number;
  winRate: number;
  rank: number;
  followers: number;
  following: number;
  accuracy: number;
  joinedAt: string;
  bio: string;
  isFollowing?: boolean;
}

interface UserProfileModalProps {
  user: UserRankData;
  isOpen: boolean;
  onClose: () => void;
  onToggleFollow?: () => void;
  onMessage?: () => void;
}

const tierColors: Record<string, string> = {
  gold: "from-yellow-400 to-yellow-600",
  silver: "from-gray-300 to-gray-500",
  bronze: "from-amber-600 to-amber-800",
  platinum: "from-purple-400 to-purple-600",
  diamond: "from-cyan-400 to-cyan-600",
};

const tierTextColors: Record<string, string> = {
  gold: "text-yellow-400",
  silver: "text-gray-300",
  bronze: "text-amber-500",
  platinum: "text-purple-400",
  diamond: "text-cyan-400",
};

export function UserProfileModal({ user, isOpen, onClose, onToggleFollow, onMessage }: UserProfileModalProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    const shareText = `Check o perfil de ${user.name} no Fan.bet! 🎮`;
    
    if (platform === "copy") {
      navigator.clipboard.writeText(`${window.location.origin}/profile/${user.id}`);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.origin)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`,
    };

    window.open(urls[platform], "_blank");
    setShowShareMenu(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full bg-card border-border p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Banner */}
        <div className={`h-24 bg-gradient-to-r ${tierColors[user.tier]} relative`}>
          <div className="absolute top-3 right-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 pb-4 -mt-10">
          {/* Avatar */}
          <div className="relative inline-block">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${tierColors[user.tier]} p-1`}>
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-2xl font-display font-bold">{user.avatarInitials}</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center">
              <Trophy className={`w-4 h-4 ${tierTextColors[user.tier]}`} />
            </div>
          </div>

          {/* Name & Rank */}
          <div className="mt-3">
            <h2 className="font-display font-bold text-xl text-foreground">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${tierTextColors[user.tier]} bg-transparent border-current text-[10px]`}>
                {user.tier.toUpperCase()}
              </Badge>
              <span className="text-muted-foreground text-xs">#{user.rank} no ranking</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-muted-foreground text-sm mt-3">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <p className="font-display font-bold text-lg text-foreground">{user.totalBets}</p>
              <p className="text-[10px] text-muted-foreground">Apostas</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <p className={`font-display font-bold text-lg ${user.winRate >= 50 ? "text-emerald-400" : "text-foreground"}`}>
                {user.winRate}%
              </p>
              <p className="text-[10px] text-muted-foreground">Vitórias</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <p className="font-display font-bold text-lg text-foreground">{user.accuracy}%</p>
              <p className="text-[10px] text-muted-foreground">Acurácia</p>
            </div>
          </div>

          {/* Followers & Following */}
          <div className="flex items-center justify-center gap-6 mt-4 py-3 border-t border-b border-border">
            <div className="text-center">
              <p className="font-display font-bold text-foreground">{user.followers}</p>
              <p className="text-[10px] text-muted-foreground">Seguidores</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-display font-bold text-foreground">{user.following}</p>
              <p className="text-[10px] text-muted-foreground">Seguindo</p>
            </div>
          </div>

          {/* Joined Date */}
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Entrou em {user.joinedAt}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onToggleFollow}
              className={`flex-1 ${user.isFollowing ? "bg-muted text-foreground" : "gradient-star text-primary-foreground font-display font-bold"}`}
            >
              {user.isFollowing ? "Seguindo" : "Seguir"}
            </Button>
            <Button
              onClick={onMessage}
              variant="outline"
              className="flex-1 border-border"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Mensagem
            </Button>
          </div>

          {/* Share Button */}
          <div className="relative mt-3">
            <Button
              onClick={() => setShowShareMenu(!showShareMenu)}
              variant="outline"
              className="w-full border-border"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Perfil
            </Button>

            {showShareMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-card border border-border rounded-lg shadow-lg">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "whatsapp", emoji: "💬", label: "WhatsApp" },
                    { id: "telegram", emoji: "✈️", label: "Telegram" },
                    { id: "twitter", emoji: "🐦", label: "Twitter" },
                    { id: "copy", emoji: "🔗", label: copied ? "Copiado!" : "Copiar" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleShare(item.id)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[10px] text-muted-foreground">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}