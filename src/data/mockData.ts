import influencer1 from "@/assets/influencer-1.jpg";
import influencer2 from "@/assets/influencer-2.jpg";
import influencer3 from "@/assets/influencer-3.jpg";

export type RankTier = "bronze" | "silver" | "gold" | "diamond";

export interface Influencer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  verified: boolean;
  hasNewStory?: boolean;
}

export interface HintCard {
  id: string;
  influencer: Influencer;
  hintImage: string;
  hintText: string;
  categories: string[];
  bettingClosesAt: string;
  isOpen: boolean;
  postedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  stars: number;
  rank: RankTier;
  totalBets: number;
  wins: number;
  avatar: string;
  following: string[];
}

export interface RankingEntry {
  rank: number;
  user: { name: string; username: string; avatar: string };
  tier: RankTier;
  stars: number;
  winRate: number;
}

export const influencers: Influencer[] = [
  { id: "1", name: "Valentina Rose", username: "@valentinarose", avatar: influencer1, followers: 2400000, verified: true, hasNewStory: true },
  { id: "2", name: "Marco Fit", username: "@marcofit", avatar: influencer2, followers: 1800000, verified: true, hasNewStory: true },
  { id: "3", name: "Sofia Eats", username: "@sofiaeats", avatar: influencer3, followers: 950000, verified: true, hasNewStory: false },
];

export const hintCards: HintCard[] = [
  {
    id: "1",
    influencer: influencers[0],
    hintImage: influencer1,
    hintText: "Me sentindo colorida hoje 🌈 O que vocês acham que estou vestindo?",
    categories: ["Roupa", "Social"],
    bettingClosesAt: "2026-03-16T20:00:00Z",
    isOpen: true,
    postedAt: "2h atrás",
  },
  {
    id: "2",
    influencer: influencers[1],
    hintImage: influencer2,
    hintText: "Dia de perna ou descanso? 🏋️ Façam suas apostas!",
    categories: ["Academia", "Comida"],
    bettingClosesAt: "2026-03-16T18:00:00Z",
    isOpen: true,
    postedAt: "4h atrás",
  },
  {
    id: "3",
    influencer: influencers[2],
    hintImage: influencer3,
    hintText: "Experimentando algo novo hoje à noite 🍝 Conseguem adivinhar?",
    categories: ["Comida", "Viagem"],
    bettingClosesAt: "2026-03-16T22:00:00Z",
    isOpen: true,
    postedAt: "1h atrás",
  },
];

export const currentUser: UserProfile = {
  id: "user1",
  name: "Alex Player",
  username: "@alexplayer",
  stars: 2450,
  rank: "gold",
  totalBets: 87,
  wins: 52,
  avatar: "",
  following: ["1", "2"],
};

export const rankings: RankingEntry[] = [
  { rank: 1, user: { name: "NightOwl", username: "@nightowl", avatar: "" }, tier: "diamond", stars: 15200, winRate: 78 },
  { rank: 2, user: { name: "BetKing", username: "@betking", avatar: "" }, tier: "diamond", stars: 12800, winRate: 72 },
  { rank: 3, user: { name: "LuckyVibes", username: "@luckyvibes", avatar: "" }, tier: "gold", stars: 9400, winRate: 68 },
  { rank: 4, user: { name: "StarChaser", username: "@starchaser", avatar: "" }, tier: "gold", stars: 7200, winRate: 65 },
  { rank: 5, user: { name: "Alex Player", username: "@alexplayer", avatar: "" }, tier: "gold", stars: 2450, winRate: 60 },
  { rank: 6, user: { name: "NewFan", username: "@newfan", avatar: "" }, tier: "silver", stars: 1800, winRate: 55 },
  { rank: 7, user: { name: "Rookie", username: "@rookie", avatar: "" }, tier: "bronze", stars: 500, winRate: 40 },
];

export const categories = [
  { id: "food", label: "🍔 Comida", icon: "🍔" },
  { id: "clothing", label: "👕 Roupa", icon: "👕" },
  { id: "gym", label: "🏋️ Academia", icon: "🏋️" },
  { id: "travel", label: "✈️ Viagem", icon: "✈️" },
  { id: "social", label: "🎉 Social", icon: "🎉" },
  { id: "politics", label: "🏛️ Política", icon: "🏛️" },
  { id: "football", label: "⚽ Futebol", icon: "⚽" },
  { id: "journalism", label: "📰 Jornalismo", icon: "📰" },
  { id: "shopping", label: "🛍️ Compras", icon: "🛍️" },
  { id: "courses", label: "📚 Cursos", icon: "📚" },
  { id: "family", label: "👨‍👩‍👧‍👦 Família", icon: "👨‍👩‍👧‍👦" },
  { id: "beauty", label: "💄 Beleza", icon: "💄" },
  { id: "sports", label: "🏅 Esporte", icon: "🏅" },
];

export const rankColors: Record<RankTier, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-gray-400 to-gray-200",
  gold: "from-yellow-500 to-amber-300",
  diamond: "from-cyan-400 to-blue-300",
};

export const rankBorderColors: Record<RankTier, string> = {
  bronze: "border-amber-600",
  silver: "border-gray-400",
  gold: "border-yellow-400",
  diamond: "border-cyan-400",
};
