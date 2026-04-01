import type { HintCard } from "@/data/mockData";
import { categories } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { StarBalance } from "./StarBalance";
import starIcon from "@/assets/star-icon.png";

interface PredictionDrawerProps {
  hint: HintCard | null;
  userStars: number;
  onClose: () => void;
  onConfirm: (hintId: string, category: string, amount: number, prediction: string) => void;
  isOwner?: boolean;
}

const predictionOptions: Record<string, string[]> = {
  food: ["🍕 Pizza", "🥗 Salada", "🍣 Sushi", "🍔 Hambúrguer", "🍝 Massa"],
  clothing: ["⬛ Preto", "⬜ Branco", "🟦 Azul", "🟥 Vermelho", "🟩 Verde"],
  gym: ["✅ Sim", "❌ Não"],
  travel: ["✅ Sim", "❌ Não"],
  social: ["🎉 Saindo", "🏠 Ficando em Casa"],
};

export function PredictionDrawer({ hint, userStars, onClose, onConfirm, isOwner }: PredictionDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [amount, setAmount] = useState(50);

  const starAmounts = [10, 25, 50, 100, 250];

  const handleConfirm = () => {
    if (!hint || !selectedCategory || !selectedPrediction || isOwner) return;
    onConfirm(hint.id, selectedCategory, amount, selectedPrediction);
    onClose();
  };

  return (
    <AnimatePresence>
      {hint && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            <div className="px-5 pb-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">Fazer Previsão</h3>
                  <p className="text-muted-foreground text-xs font-body">{hint.influencer.name}</p>
                </div>
                <button onClick={onClose} className="text-muted-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="font-display font-semibold text-sm text-foreground mb-2">Categoria</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedPrediction(null); }}
                    className={`px-3 py-2 rounded-lg text-sm font-body transition-all ${
                      selectedCategory === cat.id
                        ? "gradient-violet text-foreground glow-violet"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {selectedCategory && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="font-display font-semibold text-sm text-foreground mb-2">Sua Previsão</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {predictionOptions[selectedCategory]?.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedPrediction(opt)}
                        className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${
                          selectedPrediction === opt
                            ? "gradient-star text-primary-foreground glow-star"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <p className="font-display font-semibold text-sm text-foreground mb-2">Valor da Aposta</p>
              <div className="flex gap-2 mb-4">
                {starAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`flex-1 py-2 rounded-lg text-sm font-display font-bold transition-all ${
                      amount === a
                        ? "gradient-star text-primary-foreground glow-star"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground text-sm font-body">Seu Saldo</span>
                <StarBalance amount={userStars} size="sm" />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!selectedCategory || !selectedPrediction || amount > userStars}
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-xl font-display font-bold text-base gradient-star text-primary-foreground glow-star disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <img src={starIcon} alt="" className="w-5 h-5" />
                Confirmar {amount} Estrelas
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
