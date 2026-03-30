import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, Clock, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { influencers } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const influencer = influencers[0];

const stats = [
  { label: "Seguidores", value: "2,4M", icon: TrendingUp },
  { label: "Dicas Ativas", value: "3", icon: MessageSquare },
  { label: "Confirmadas Hoje", value: "1", icon: CheckCircle2 },
  { label: "Pendentes", value: "2", icon: Clock },
];

export default function InfluencerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-star to-secondary">
          <img
            src={influencer.avatar}
            alt={influencer.name}
            className="w-full h-full rounded-full object-cover border-2 border-background"
          />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">{influencer.name}</h1>
          <p className="text-sm text-muted-foreground">{influencer.username}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="gradient-card border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-star" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="font-display font-semibold text-foreground">Ações Rápidas</h2>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button
            onClick={() => navigate("/influencer/post-hint")}
            className="w-full h-14 gradient-star text-primary-foreground font-display font-semibold text-base glow-star"
          >
            <Camera className="w-5 h-5 mr-2" />
            Postar Dica do Dia
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button
            onClick={() => navigate("/influencer/questionnaire")}
            className="w-full h-14 gradient-violet text-secondary-foreground font-display font-semibold text-base glow-violet"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Responder Questionário Diário
          </Button>
        </motion.div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display font-semibold text-foreground">Dicas de Hoje</h2>
        {[
          { text: "Me sentindo colorida hoje 🌈", time: "2h atrás", status: "pending" },
          { text: "Dia de perna ou descanso? 🏋️", time: "5h atrás", status: "confirmed" },
        ].map((hint, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{hint.text}</p>
                  <p className="text-xs text-muted-foreground">{hint.time}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    hint.status === "confirmed"
                      ? "bg-accent/20 text-accent"
                      : "bg-star/20 text-star"
                  }`}
                >
                  {hint.status === "confirmed" ? "Confirmada" : "Pendente"}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
