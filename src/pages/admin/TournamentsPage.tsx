import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Plus, Calendar, Star, Clock, Users, ChevronRight,
  Coins, Crown, Zap, Edit, Trash2, Play, CheckCircle,
  X, Loader2, AlertCircle, Timer
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Tournament {
  id: string;
  name: string;
  description: string;
  status: "upcoming" | "active" | "ended";
  prize_currency: string;
  prize_amount: number;
  start_date: string;
  end_date: string;
  participants: number;
  max_participants: number;
  category: string;
  rules: string;
  winner?: string;
}

const currencyEmoji: Record<string, string> = {
  stars: "⭐", diamonds: "💎", gold: "🪙", crowns: "👑", unicorns: "🦄", chickens: "🐔",
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  upcoming: { label: "Em Breve",  color: "bg-blue-400/15 text-blue-400 border-blue-400/20",     icon: Clock },
  active:   { label: "Ativo",     color: "bg-emerald-400/15 text-emerald-400 border-emerald-400/20", icon: Play },
  ended:    { label: "Encerrado", color: "bg-gray-400/15 text-gray-400 border-gray-400/20",     icon: CheckCircle },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const getTimeRemaining = (end: string) => {
  const diff = new Date(end).getTime() - Date.now();
  if (diff <= 0) return "Encerrado";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// Mock tournaments
const initialTournaments: Tournament[] = [
  {
    id: "1", name: "Copa das Estrelas 🏆",
    description: "O maior torneio da plataforma. Aposte nas previsões políticas e suba no ranking!",
    status: "active", prize_currency: "crowns", prize_amount: 10,
    start_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    participants: 342, max_participants: 500, category: "politics",
    rules: "Top 3 apostadores com maior taxa de acerto ganham prêmios em Crowns",
  },
  {
    id: "2", name: "Desafio Futebol 2026 ⚽",
    description: "Preveja os resultados da Copa do Mundo e concorra a Unicórnios raros!",
    status: "upcoming", prize_currency: "unicorns", prize_amount: 3,
    start_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    participants: 0, max_participants: 1000, category: "football",
    rules: "Aposte em qualquer moeda. Vença com a maior sequência de acertos.",
  },
  {
    id: "3", name: "Torneio Influencer VIP 💎",
    description: "Exclusivo para fãs com mais de 20 apostas. Prêmio em Diamantes!",
    status: "ended", prize_currency: "diamonds", prize_amount: 50,
    start_date: new Date(Date.now() - 14 * 86400000).toISOString(),
    end_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    participants: 89, max_participants: 100, category: "social",
    rules: "Quem acertar mais previsões de influenciadores verificados vence.",
    winner: "NightOwl_BR",
  },
];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "", description: "", prize_currency: "crowns", prize_amount: "1",
    start_date: "", end_date: "", max_participants: "100", category: "politics", rules: "",
  });
  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filtered = filterStatus === "all" ? tournaments : tournaments.filter(t => t.status === filterStatus);

  const handleCreate = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      toast.error("Preencha nome e datas do torneio");
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    const now = new Date();
    const start = new Date(form.start_date);
    const status: Tournament["status"] = start > now ? "upcoming" : "active";
    const newTournament: Tournament = {
      id: Date.now().toString(),
      ...form,
      prize_amount: Number(form.prize_amount),
      max_participants: Number(form.max_participants),
      participants: 0,
      status,
    };
    setTournaments(prev => [newTournament, ...prev]);
    setIsSaving(false);
    setIsCreateOpen(false);
    setForm({ name: "", description: "", prize_currency: "crowns", prize_amount: "1", start_date: "", end_date: "", max_participants: "100", category: "politics", rules: "" });
    toast.success(`🏆 Torneio "${newTournament.name}" criado com sucesso!`);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir este torneio?")) return;
    setTournaments(prev => prev.filter(t => t.id !== id));
    setIsDetailOpen(false);
    toast.success("Torneio excluído");
  };

  const activeTournaments = tournaments.filter(t => t.status === "active");
  const totalParticipants = tournaments.reduce((s, t) => s + t.participants, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Torneios Ativos", value: activeTournaments.length, icon: Zap, color: "text-emerald-400" },
          { label: "Participantes Total", value: totalParticipants.toLocaleString("pt-BR"), icon: Users, color: "text-blue-400" },
          { label: "Em Breve", value: tournaments.filter(t=>t.status==="upcoming").length, icon: Clock, color: "text-yellow-400" },
          { label: "Encerrados", value: tournaments.filter(t=>t.status==="ended").length, icon: Trophy, color: "text-purple-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#0d0f1a] border-white/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-xl">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter + Create */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {["all", "active", "upcoming", "ended"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                  : "bg-white/5 text-white/50 border border-white/5 hover:text-white"
              }`}
            >
              {s === "all" ? "Todos" : statusConfig[s].label}
            </button>
          ))}
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-yellow-400 text-black hover:bg-yellow-500 text-xs h-9 gap-2"
        >
          <Plus size={14} /> Novo Torneio
        </Button>
      </div>

      {/* Tournament Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((tournament, i) => {
          const st = statusConfig[tournament.status];
          const Icon = st.icon;
          const fillPct = tournament.max_participants > 0
            ? Math.round((tournament.participants / tournament.max_participants) * 100)
            : 0;
          return (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card
                className="bg-[#0d0f1a] border-white/5 p-5 cursor-pointer hover:border-white/10 transition-all group"
                onClick={() => { setSelectedTournament(tournament); setIsDetailOpen(true); }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-base truncate">{tournament.name}</h3>
                    </div>
                    <p className="text-white/40 text-xs line-clamp-2">{tournament.description}</p>
                  </div>
                  <Badge className={`text-[10px] border flex items-center gap-1 shrink-0 ${st.color}`}>
                    <Icon size={10} /> {st.label}
                  </Badge>
                </div>

                {/* Prize */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-4">
                  <span className="text-2xl">{currencyEmoji[tournament.prize_currency] || "⭐"}</span>
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">
                      {tournament.prize_amount.toLocaleString()} {tournament.prize_currency}
                    </p>
                    <p className="text-white/40 text-[10px]">Prêmio para o 1º colocado</p>
                  </div>
                  <Crown size={16} className="text-yellow-400 ml-auto" />
                </div>

                {/* Participants bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
                    <span className="flex items-center gap-1"><Users size={10} /> {tournament.participants} participantes</span>
                    <span>{fillPct}% preenchido</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {tournament.status === "active" && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Timer size={10} /> {getTimeRemaining(tournament.end_date)} restantes
                      </span>
                    )}
                    {tournament.status === "upcoming" && `Começa ${formatDate(tournament.start_date)}`}
                    {tournament.status === "ended" && tournament.winner && (
                      <span className="text-yellow-400">🏆 Vencedor: {tournament.winner}</span>
                    )}
                  </span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="bg-[#0d0f1a] border-white/5 p-12 text-center">
          <Trophy size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Nenhum torneio nesta categoria</p>
        </Card>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" /> Novo Torneio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Nome do Torneio</label>
              <Input value={form.name} onChange={e => setField("name", e.target.value)}
                placeholder="Ex: Copa das Estrelas 🏆"
                className="bg-white/5 border-white/10 text-white text-sm h-10" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Descrição</label>
              <Textarea value={form.description} onChange={e => setField("description", e.target.value)}
                placeholder="Descreva o torneio e seus objetivos..."
                className="bg-white/5 border-white/10 text-white text-sm min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Moeda do Prêmio</label>
                <Select value={form.prize_currency} onValueChange={v => setField("prize_currency", v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141828] border-white/10">
                    {Object.entries(currencyEmoji).map(([k, e]) => (
                      <SelectItem key={k} value={k} className="text-white/70 text-xs capitalize">{e} {k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Quantidade do Prêmio</label>
                <Input value={form.prize_amount} onChange={e => setField("prize_amount", e.target.value)}
                  type="number" min="1" placeholder="10"
                  className="bg-white/5 border-white/10 text-white text-sm h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Data de Início</label>
                <Input value={form.start_date} onChange={e => setField("start_date", e.target.value)}
                  type="datetime-local"
                  className="bg-white/5 border-white/10 text-white text-sm h-10" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Data de Fim</label>
                <Input value={form.end_date} onChange={e => setField("end_date", e.target.value)}
                  type="datetime-local"
                  className="bg-white/5 border-white/10 text-white text-sm h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Categoria</label>
                <Select value={form.category} onValueChange={v => setField("category", v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141828] border-white/10">
                    {[["politics","🏛️ Política"],["football","⚽ Futebol"],["social","🎉 Social"],["food","🍔 Comida"],["sports","🏅 Esportes"],["all","🎯 Todas"]].map(([v,l]) => (
                      <SelectItem key={v} value={v} className="text-white/70 text-xs">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Máx. de Participantes</label>
                <Input value={form.max_participants} onChange={e => setField("max_participants", e.target.value)}
                  type="number" min="1" placeholder="500"
                  className="bg-white/5 border-white/10 text-white text-sm h-10" />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Regras do Torneio</label>
              <Textarea value={form.rules} onChange={e => setField("rules", e.target.value)}
                placeholder="Descreva as regras, critérios de desempate e como o vencedor será escolhido..."
                className="bg-white/5 border-white/10 text-white text-sm min-h-[80px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-white/60 h-9 text-xs">
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isSaving} className="bg-yellow-400 text-black hover:bg-yellow-500 h-9 text-xs gap-2">
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Trophy size={13} />}
              {isSaving ? "Criando..." : "Criar Torneio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2"><Trophy size={18} className="text-yellow-400" /> Detalhes do Torneio</span>
              <button onClick={() => setIsDetailOpen(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </DialogTitle>
          </DialogHeader>
          {selectedTournament && (() => {
            const st = statusConfig[selectedTournament.status];
            const Icon = st.icon;
            return (
              <div className="space-y-4 py-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-lg">{selectedTournament.name}</h3>
                    <Badge className={`text-[10px] border flex items-center gap-1 ${st.color}`}>
                      <Icon size={10} /> {st.label}
                    </Badge>
                  </div>
                  <p className="text-white/50 text-sm">{selectedTournament.description}</p>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <span className="text-3xl">{currencyEmoji[selectedTournament.prize_currency]}</span>
                  <div>
                    <p className="text-white font-bold text-xl">{selectedTournament.prize_amount} {selectedTournament.prize_currency}</p>
                    <p className="text-white/40 text-xs">Prêmio principal</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Participantes", value: `${selectedTournament.participants} / ${selectedTournament.max_participants}` },
                    { label: "Categoria", value: selectedTournament.category },
                    { label: "Início", value: formatDate(selectedTournament.start_date) },
                    { label: "Fim", value: formatDate(selectedTournament.end_date) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3">
                      <p className="text-white/40 text-xs mb-1">{label}</p>
                      <p className="text-white text-sm font-medium capitalize">{value}</p>
                    </div>
                  ))}
                </div>
                {selectedTournament.rules && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/40 text-xs mb-1">Regras</p>
                    <p className="text-white/70 text-sm">{selectedTournament.rules}</p>
                  </div>
                )}
                {selectedTournament.winner && (
                  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 flex items-center gap-3">
                    <Crown size={20} className="text-yellow-400" />
                    <div>
                      <p className="text-yellow-400 font-semibold text-sm">Vencedor 🏆</p>
                      <p className="text-white/70 text-xs">{selectedTournament.winner}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter className="gap-2">
            <Button
              onClick={() => handleDelete(selectedTournament!.id)}
              className="bg-red-400/20 text-red-400 hover:bg-red-400/30 h-9 text-xs gap-1"
            >
              <Trash2 size={13} /> Excluir
            </Button>
            <Button className="bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 h-9 text-xs gap-1 ml-auto">
              <Edit size={13} /> Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
