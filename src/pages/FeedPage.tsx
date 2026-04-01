import { useState, useMemo, useEffect } from "react";
import { hintCards, currentUser, influencers } from "@/data/mockData";
import type { HintCard } from "@/data/mockData";
import { HintFeedCard } from "@/components/HintFeedCard";
import { PredictionDrawer } from "@/components/PredictionDrawer";
import { StoryRow } from "@/components/StoryRow";
import { SearchBar } from "@/components/SearchBar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { localDB, LocalPost } from "@/lib/storage";
import { useWallet } from "@/hooks/useWallet";
import type { CurrencyType } from "@/data/currencies";
import { currencies } from "@/data/currencies";

type FeedTab = "all" | "following";

export default function FeedPage() {
  const [selectedHint, setSelectedHint] = useState<HintCard | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>(currentUser.following);
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [localPosts, setLocalPosts] = useState<LocalPost[]>([]);
  const { wallet } = useWallet();

  useEffect(() => {
    const fetchLocalPosts = async () => {
      try {
        const posts = await localDB.getPosts();
        setLocalPosts(posts);
      } catch (err) {
        console.error("Failed to load local posts", err);
      }
    };
    fetchLocalPosts();
  }, []);

  const toggleFollow = (influencerId: string) => {
    setFollowingIds((prev) =>
      prev.includes(influencerId)
        ? prev.filter((id) => id !== influencerId)
        : [...prev, influencerId]
    );
    const inf = influencers.find((i) => i.id === influencerId);
    if (inf) {
      const isNowFollowing = !followingIds.includes(influencerId);
      toast(isNowFollowing ? `Seguindo ${inf.name} ⭐` : `Deixou de seguir ${inf.name}`);
    }
  };

  const filteredHints = useMemo(() => {
    let hints = [...localPosts, ...hintCards];

    if (activeTab === "following") {
      hints = hints.filter((h) => followingIds.includes(h.influencer.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      hints = hints.filter(
        (h) =>
          h.influencer.name.toLowerCase().includes(q) ||
          h.hintText.toLowerCase().includes(q) ||
          h.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    return hints;
  }, [activeTab, followingIds, searchQuery]);

  const handlePredict = (hint: HintCard) => {
    if (hint.influencer.id === currentUser.id) {
      toast.error("Você não pode apostar no seu próprio post!");
      return;
    }
    setSelectedHint(hint);
  };

  const handleConfirm = (
    hintId: string,
    category: string,
    amount: number,
    prediction: string,
    currency: CurrencyType
  ) => {
    const cur = currencies.find((c) => c.id === currency);
    const emoji = cur?.emoji ?? "⭐";
    const name = cur?.name ?? "Estrelas";
    toast.success(`${emoji} ${amount} ${name} apostadas em "${prediction}"!`, {
      description: `Categoria: ${category} · Boa sorte! Os resultados saem à meia-noite.`,
    });
  };

  const tabs: { key: FeedTab; label: string }[] = [
    { key: "all", label: "Descobrir" },
    { key: "following", label: "Seguindo" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-4">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
              activeTab === tab.key
                ? "gradient-star text-primary-foreground glow-star"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <StoryRow followingIds={followingIds} onToggleFollow={toggleFollow} />

      {filteredHints.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-body text-sm">
            {activeTab === "following"
              ? "Siga influenciadores para ver suas dicas aqui!"
              : "Nenhuma dica encontrada para sua busca."}
          </p>
        </div>
      ) : (
        filteredHints.map((hint, i) => (
          <motion.div
            key={hint.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <HintFeedCard
              hint={hint}
              onPredict={handlePredict}
              isFollowing={followingIds.includes(hint.influencer.id)}
              onToggleFollow={() => toggleFollow(hint.influencer.id)}
              isOwner={hint.influencer.id === currentUser.id}
            />
          </motion.div>
        ))
      )}

      <PredictionDrawer
        hint={selectedHint}
        userWallet={wallet}
        onClose={() => setSelectedHint(null)}
        onConfirm={handleConfirm}
        isOwner={selectedHint?.influencer.id === currentUser.id}
      />
    </div>
  );
}
