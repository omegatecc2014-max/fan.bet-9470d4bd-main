import { currencies, rarityColors } from "@/data/currencies";
import type { CurrencyType } from "@/data/currencies";
import { CurrencyBadge } from "@/components/CurrencyBadge";
import { motion } from "framer-motion";
import starIcon from "@/assets/star-icon.png";
import { ArrowDownLeft, ArrowUpRight, Plus, ArrowRightLeft, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";

const packages = [
  { currency: "stars" as CurrencyType, amount: 500, price: "R$19,90", popular: true },
  { currency: "diamonds" as CurrencyType, amount: 10, price: "R$24,90" },
  { currency: "chickens" as CurrencyType, amount: 50, price: "R$9,90" },
  { currency: "gold" as CurrencyType, amount: 3, price: "R$49,90" },
  { currency: "crowns" as CurrencyType, amount: 1, price: "R$99,90" },
  { currency: "unicorns" as CurrencyType, amount: 1, price: "R$249,90" },
];

const history = [
  { type: "win", desc: "Ganhou: Valentina usou Vermelho", currency: "stars" as CurrencyType, amount: 120, time: "2h atrás" },
  { type: "bet", desc: "Apostou: Marco vai à academia", currency: "diamonds" as CurrencyType, amount: -5, time: "5h atrás" },
  { type: "purchase", desc: "Comprou Galinhas", currency: "chickens" as CurrencyType, amount: 50, time: "1d atrás" },
  { type: "win", desc: "Ganhou: Sofia comeu Sushi", currency: "gold" as CurrencyType, amount: 1, time: "1d atrás" },
  { type: "reward", desc: "Sequência de login diário 🔥", currency: "crowns" as CurrencyType, amount: 1, time: "2d atrás" },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "shop" | "convert">("portfolio");
  const { wallet, purchasePackage, isPurchasing } = useWallet();

  const totalValue = currencies.reduce((sum, c) => {
    return sum + wallet[c.id] * c.value;
  }, 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* Saldo Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="gradient-card rounded-2xl border border-border p-6 mb-5 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["⭐", "💎", "🐔", "👑", "🦄", "🪙"].map((e, i) => (
            <motion.span
              key={i}
              className="absolute text-lg opacity-10"
              style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            >
              {e}
            </motion.span>
          ))}
        </div>

        <p className="text-muted-foreground text-sm font-body mb-1 relative z-10">Valor Total do Portfólio</p>
        <div className="flex items-center justify-center gap-2 mb-1 relative z-10">
          <img src={starIcon} alt="" className="w-7 h-7" />
          <span className="font-display font-extrabold text-3xl text-star">
            {totalValue.toLocaleString()}
          </span>
        </div>
        <p className="text-muted-foreground text-xs font-body relative z-10">em equivalente de Estrelas</p>

        <div className="flex justify-center gap-2 mt-4 flex-wrap relative z-10">
          {currencies.filter(c => wallet[c.id] > 0).map(c => (
            <CurrencyBadge key={c.id} currency={c} amount={wallet[c.id]} size="sm" />
          ))}
        </div>
      </motion.div>

      {/* Abas */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1 mb-5">
        {(["portfolio", "shop", "convert"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-display font-bold capitalize transition-all ${
              activeTab === tab
                ? "gradient-star text-primary-foreground glow-star"
                : "text-muted-foreground"
            }`}
          >
            {tab === "convert" ? "Converter" : tab === "shop" ? "Loja" : "Portfólio"}
          </button>
        ))}
      </div>

      {/* Aba Portfólio */}
      {activeTab === "portfolio" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="space-y-2.5 mb-8">
            {currencies.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border group hover:border-border/80 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl ${c.gradientClass} flex items-center justify-center text-xl ${c.glowClass}`}>
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-sm text-foreground">{c.name}</p>
                    <span className={`text-[10px] font-display font-semibold uppercase px-1.5 py-0.5 rounded-full bg-muted ${rarityColors[c.rarity]}`}>
                      {c.rarity}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs font-body truncate">{c.description}</p>
                </div>
                <div className="text-right">
                  <p className={`font-display font-bold text-base ${c.textColorClass}`}>
                    {wallet[c.id].toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-[10px] font-body">
                    = {(wallet[c.id] * c.value).toLocaleString()} ⭐
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Histórico */}
          <h3 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-star" /> Atividade Recente
          </h3>
          <div className="space-y-2">
            {history.map((item, i) => {
              const cur = currencies.find(c => c.id === item.currency)!;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.amount > 0 ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    {item.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-body truncate">{item.desc}</p>
                    <p className="text-muted-foreground text-xs font-body">{item.time}</p>
                  </div>
                  <span className={`font-display font-bold text-sm flex items-center gap-1 ${item.amount > 0 ? cur.textColorClass : "text-muted-foreground"}`}>
                    <span className="text-xs">{cur.emoji}</span>
                    {item.amount > 0 ? "+" : ""}{Math.abs(item.amount)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Aba Loja */}
      {activeTab === "shop" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 gap-3">
            {packages.map((pkg, i) => {
              const cur = currencies.find(c => c.id === pkg.currency)!;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isPurchasing}
                  onClick={() => purchasePackage(pkg.currency, pkg.amount)}
                  className={`relative p-4 rounded-xl border text-center transition-all disabled:opacity-50 ${
                    pkg.popular ? `border-star glow-star gradient-card` : "border-border bg-card"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-display font-bold gradient-star text-primary-foreground px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl ${cur.gradientClass} ${cur.glowClass} flex items-center justify-center text-2xl mx-auto mb-2`}>
                    {cur.emoji}
                  </div>
                  <p className={`font-display font-bold ${cur.textColorClass}`}>
                    {pkg.amount.toLocaleString()} {cur.name}
                  </p>
                  <p className="text-muted-foreground text-sm font-body">{pkg.price}</p>
                  <span className={`text-[10px] font-display uppercase mt-1 inline-block ${rarityColors[cur.rarity]}`}>
                    {cur.rarity}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Aba Converter */}
      {activeTab === "convert" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="gradient-card rounded-2xl border border-border p-5 mb-4 text-center">
            <ArrowRightLeft className="w-8 h-8 text-star mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-foreground mb-1">Câmbio de Moedas</h3>
            <p className="text-muted-foreground text-sm font-body mb-4">Troque entre moedas pelas taxas de mercado</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => toast.info("Câmbio disponível em breve!")}
              className="gradient-star text-primary-foreground font-display font-bold text-sm px-6 py-2.5 rounded-full glow-star"
            >
              Abrir Câmbio
            </motion.button>
          </div>

          <h4 className="font-display font-semibold text-sm text-foreground mb-3">Taxas de Câmbio</h4>
          <div className="space-y-2">
            {currencies.filter(c => c.id !== "stars").map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="font-body text-sm text-foreground flex-1">1 {c.name}</span>
                <span className="font-display font-bold text-sm text-star">= {c.value} ⭐</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
