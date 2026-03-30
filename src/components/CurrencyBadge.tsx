import type { Currency } from "@/data/currencies";
import { motion } from "framer-motion";

interface CurrencyBadgeProps {
  currency: Currency;
  amount: number;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

export function CurrencyBadge({ currency, amount, size = "md", showName = false }: CurrencyBadgeProps) {
  const sizeMap = {
    sm: { text: "text-xs", emoji: "text-sm", gap: "gap-1", px: "px-2 py-0.5" },
    md: { text: "text-sm", emoji: "text-base", gap: "gap-1.5", px: "px-2.5 py-1" },
    lg: { text: "text-lg", emoji: "text-xl", gap: "gap-2", px: "px-3 py-1.5" },
  };
  const s = sizeMap[size];

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center ${s.gap} ${s.px} rounded-full bg-muted/60 border border-border`}
    >
      <span className={s.emoji}>{currency.emoji}</span>
      <span className={`font-display font-bold ${s.text} ${currency.textColorClass}`}>
        {amount.toLocaleString()}
      </span>
      {showName && (
        <span className={`font-body ${s.text} text-muted-foreground`}>{currency.name}</span>
      )}
    </motion.div>
  );
}
