export type CurrencyType = "stars" | "diamonds" | "gold" | "crowns" | "unicorns" | "chickens";

export interface Currency {
  id: CurrencyType;
  name: string;
  emoji: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "meme";
  gradientClass: string;
  glowClass: string;
  textColorClass: string;
  value: number; // relative value (stars = 1)
}

export const currencies: Currency[] = [
  {
    id: "stars",
    name: "Stars",
    emoji: "⭐",
    description: "The everyday currency for predictions",
    rarity: "common",
    gradientClass: "gradient-star",
    glowClass: "glow-star",
    textColorClass: "text-star",
    value: 1,
  },
  {
    id: "diamonds",
    name: "Diamonds",
    emoji: "💎",
    description: "Premium gems for high-stakes bets",
    rarity: "uncommon",
    gradientClass: "gradient-diamond",
    glowClass: "glow-diamond",
    textColorClass: "text-[hsl(199,95%,60%)]",
    value: 10,
  },
  {
    id: "gold",
    name: "Gold Bars",
    emoji: "🪙",
    description: "Elite reserves for serious players",
    rarity: "rare",
    gradientClass: "gradient-gold-bar",
    glowClass: "glow-star",
    textColorClass: "text-[hsl(38,92%,50%)]",
    value: 50,
  },
  {
    id: "crowns",
    name: "Crowns",
    emoji: "👑",
    description: "Royal tokens for the top-ranked",
    rarity: "epic",
    gradientClass: "gradient-crown",
    glowClass: "glow-crown",
    textColorClass: "text-[hsl(280,80%,60%)]",
    value: 200,
  },
  {
    id: "unicorns",
    name: "Unicorns",
    emoji: "🦄",
    description: "Mythical beasts – ultra rare rewards",
    rarity: "legendary",
    gradientClass: "gradient-unicorn",
    glowClass: "glow-unicorn",
    textColorClass: "text-[hsl(320,85%,65%)]",
    value: 1000,
  },
  {
    id: "chickens",
    name: "Chickens",
    emoji: "🐔",
    description: "Why not? Cluck your way to glory",
    rarity: "meme",
    gradientClass: "gradient-chicken",
    glowClass: "glow-star",
    textColorClass: "text-[hsl(30,90%,55%)]",
    value: 5,
  },
];

export interface UserWallet {
  stars: number;
  diamonds: number;
  gold: number;
  crowns: number;
  unicorns: number;
  chickens: number;
}

export const initialWalletData: UserWallet = {
  stars: 2450,
  diamonds: 38,
  gold: 5,
  crowns: 1,
  unicorns: 0,
  chickens: 142,
};

export const rarityColors: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-[hsl(199,95%,60%)]",
  rare: "text-[hsl(38,92%,50%)]",
  epic: "text-[hsl(280,80%,60%)]",
  legendary: "text-[hsl(320,85%,65%)]",
  meme: "text-[hsl(30,90%,55%)]",
};
