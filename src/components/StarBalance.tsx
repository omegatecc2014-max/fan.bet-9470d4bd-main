import starIcon from "@/assets/star-icon.png";
import { motion } from "framer-motion";

interface StarBalanceProps {
  amount: number;
  size?: "sm" | "md" | "lg";
}

export function StarBalance({ amount, size = "md" }: StarBalanceProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-lg gap-1.5",
    lg: "text-2xl gap-2",
  };
  const iconSize = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };

  return (
    <motion.div
      className={`flex items-center font-display font-bold text-star ${sizeClasses[size]}`}
      whileTap={{ scale: 0.95 }}
    >
      <img src={starIcon} alt="Estrelas" className={iconSize[size]} />
      <span>{amount.toLocaleString()}</span>
    </motion.div>
  );
}
