import type { HintCard } from "@/data/mockData";
import { categories, predictionQuestions } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { currencies } from "@/data/currencies";
import type { CurrencyType, UserWallet } from "@/data/currencies";

interface PredictionDrawerProps {
  hint: HintCard | null;
  userWallet: UserWallet;
  onClose: () => void;
  onConfirm: (hintId: string, category: string, amount: number, prediction: string, currency: CurrencyType) => void;
  isOwner?: boolean;
}

// Suggested bet amounts per currency (based on value)
const betAmounts: Record<CurrencyType, number[]> = {
  stars:    [10, 25, 50, 100, 250],
  diamonds: [1, 2, 5, 10, 20],
  gold:     [1, 2, 3, 5, 10],
  crowns:   [1, 2, 3],
  unicorns: [1, 2],
  chickens: [5, 10, 25, 50, 100],
};

export function PredictionDrawer({ hint, userWallet, onClose, onConfirm, isOwner }: PredictionDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("stars");
  const [amount, setAmount] = useState(50);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const activeCurrency = currencies.find((c) => c.id === selectedCurrency)!;
  const userBalance = userWallet[selectedCurrency];
  const amounts = betAmounts[selectedCurrency];

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedPrediction(null);
    setQuestionIndex(0); // reset question on category change
  };

  const handleCurrencySelect = (cur: CurrencyType) => {
    setSelectedCurrency(cur);
    setAmount(betAmounts[cur][0]);
    setShowCurrencyPicker(false);
  };

  const handleAmountSelect = (a: number) => setAmount(a);

  const handleConfirm = () => {
    if (!hint || !selectedCategory || !selectedPrediction || isOwner) return;
    onConfirm(hint.id, selectedCategory, amount, selectedPrediction, selectedCurrency);
    onClose();
  };

  // Get questions for selected category
  const questions = selectedCategory ? (predictionQuestions[selectedCategory] ?? null) : null;
  const currentQuestion = questions ? questions[questionIndex] : null;
  const totalQuestions = questions ? questions.length : 0;

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">Fazer Previsão</h3>
                  <p className="text-muted-foreground text-xs font-body">{hint.influencer.name}</p>
                </div>
                <button onClick={onClose} className="text-muted-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Currency Selector */}
              <p className="font-display font-semibold text-sm text-foreground mb-2">Moeda da Aposta</p>
              <div className="relative mb-5">
                <button
                  onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    showCurrencyPicker ? "border-violet-400 bg-violet-500/10" : "border-border bg-muted/30"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg ${activeCurrency.gradientClass} ${activeCurrency.glowClass} flex items-center justify-center text-lg shrink-0`}>
                    {activeCurrency.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-display font-bold text-sm ${activeCurrency.textColorClass}`}>{activeCurrency.name}</p>
                    <p className="text-muted-foreground text-xs font-body">
                      Saldo: <span className="font-semibold text-foreground">{userBalance.toLocaleString()}</span>
                    </p>
                  </div>
                  {showCurrencyPicker ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {showCurrencyPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden"
                    >
                      {currencies.map((cur) => {
                        const bal = userWallet[cur.id];
                        const isSelected = selectedCurrency === cur.id;
                        return (
                          <button
                            key={cur.id}
                            onClick={() => handleCurrencySelect(cur.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-muted/50 ${
                              isSelected ? "bg-muted/70" : ""
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg ${cur.gradientClass} flex items-center justify-center text-base shrink-0`}>
                              {cur.emoji}
                            </div>
                            <div className="flex-1 text-left">
                              <p className={`font-display font-bold text-sm ${cur.textColorClass}`}>{cur.name}</p>
                              <p className="text-muted-foreground text-[11px] font-body">{cur.rarity} · valor {cur.value}⭐</p>
                            </div>
                            <span className={`font-display font-bold text-sm ${cur.textColorClass}`}>
                              {bal.toLocaleString()}
                            </span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-violet-400 ml-1 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category Selector */}
              <p className="font-display font-semibold text-sm text-foreground mb-2">Categoria</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
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

              {/* Question & Prediction Options */}
              {selectedCategory && currentQuestion && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Question header with navigation */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display font-semibold text-sm text-foreground flex-1 pr-2">
                      {currentQuestion.question}
                    </p>
                    {totalQuestions > 1 && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { setQuestionIndex((i) => Math.max(0, i - 1)); setSelectedPrediction(null); }}
                          disabled={questionIndex === 0}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted/80 transition-all"
                        >
                          <ChevronUp className="w-3 h-3 rotate-[-90deg]" />
                        </button>
                        <span className="text-[10px] text-muted-foreground font-body">{questionIndex + 1}/{totalQuestions}</span>
                        <button
                          onClick={() => { setQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1)); setSelectedPrediction(null); }}
                          disabled={questionIndex === totalQuestions - 1}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted/80 transition-all"
                        >
                          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedPrediction(opt)}
                        className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${
                          selectedPrediction === opt
                            ? `${activeCurrency.gradientClass} text-primary-foreground ${activeCurrency.glowClass}`
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Bet Amount */}
              <p className="font-display font-semibold text-sm text-foreground mb-2">Valor da Aposta</p>
              <div className="flex gap-2 mb-4 flex-wrap">
                {amounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => handleAmountSelect(a)}
                    className={`flex-1 min-w-[3.5rem] py-2 rounded-lg text-sm font-display font-bold transition-all ${
                      amount === a
                        ? `${activeCurrency.gradientClass} text-primary-foreground ${activeCurrency.glowClass}`
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              {/* Balance display */}
              <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground text-sm font-body">Seu Saldo</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activeCurrency.emoji}</span>
                  <span className={`font-display font-bold text-base ${activeCurrency.textColorClass}`}>
                    {userBalance.toLocaleString()} {activeCurrency.name}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!selectedCategory || !selectedPrediction || amount > userBalance || isOwner}
                onClick={handleConfirm}
                className={`w-full py-3.5 rounded-xl font-display font-bold text-base text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${activeCurrency.gradientClass} ${activeCurrency.glowClass}`}
              >
                <span className="text-lg">{activeCurrency.emoji}</span>
                Confirmar {amount} {activeCurrency.name}
              </motion.button>

              {isOwner && (
                <p className="text-center text-xs text-muted-foreground font-body mt-2">
                  Você não pode apostar no próprio post
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
