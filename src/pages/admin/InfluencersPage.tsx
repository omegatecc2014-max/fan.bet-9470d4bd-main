import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, TrendingUp, Users, DollarSign, Search, CheckCircle2,
  XCircle, Filter, ChevronDown, Award, Loader2, Ban
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useInfluencers, useUpdateInfluencerStatus } from "@/hooks/admin/useInfluencers";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const tierStyle: Record<string, string> = {
  gold:   "bg-[#FFD700]/15 text-[#FFD700] border-[#FFD700]/30",
  silver: "bg-[#C0C0C0]/15 text-[#C0C0C0] border-[#C0C0C0]/30",
  bronze: "bg-[#CD7F32]/15 text-[#CD7F32] border-[#CD7F32]/30",
};

export default function InfluencersPage() {
  const [filterTier, setFilterTier] = useState("all");
  const [search, setSearch] = useState("");
  const { data: allInfluencers = [], isLoading } = useInfluencers();
  const updateStatus = useUpdateInfluencerStatus();

  const handleStatusChange = async (profileId: string, status: "active" | "suspended" | "banned") => {
    try {
      await updateStatus.mutateAsync({ profileId, status });
      toast.success(status === "active" ? "Aprovado via webhook simulado" : "Status atualizado");
    } catch { toast.error("Erro ao atualizar influenciador"); }
  };

  const influencers = allInfluencers.filter(inf => {
    if (filterTier !== "all" && inf.tier !== filterTier) return false;
    if (search && !inf.handle.toLowerCase().includes(search.toLowerCase()) && !inf.profile.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pending = influencers.filter(i => i.profile.status === "pending");
  const active  = influencers.filter(i => i.profile.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Ativos",     value: isLoading ? "..." : allInfluencers.filter(i => i.profile.status === "active").length, icon: Star, color: "text-yellow-400" },
          { label: "Receita Gerada",   value: "R$ 48.2k",                                                                             icon: DollarSign, color: "text-emerald-400" },
          { label: "Novos Fãs (30d)",  value: "8.420",                                                                                icon: Users, color: "text-blue-400" },
          { label: "Pendente Aprovação",value: isLoading ? "..." : allInfluencers.filter(i => i.profile.status === "pending").length, icon: TrendingUp, color: "text-purple-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-[#0d0f1a] border-white/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs mb-1">{k.label}</p>
              <p className="font-display font-bold text-white text-xl">{k.value}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <k.icon size={18} className={k.color} />
            </div>
          </Card>
        ))}
      </div>

      {/* Pending Applications */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Aguardando Aprovação ({pending.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {pending.map((req) => (
                <motion.div key={req.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="bg-[#0d0f1a] border-yellow-400/20 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-sm">
                        {req.profile.avatar_initials}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{req.profile.name}</p>
                        <p className="text-white/40 text-xs">{req.handle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4 bg-white/5 p-2 rounded-lg text-center">
                      <div><p className="text-white font-bold text-sm">{req.followers.toLocaleString()}</p><p className="text-white/30 text-[10px]">Followers Base</p></div>
                      <div><p className="text-emerald-400 font-bold text-sm">{req.accuracy_pct}%</p><p className="text-white/30 text-[10px]">Win Rate</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={updateStatus.isPending}
                        onClick={() => handleStatusChange(req.profile_id, "active")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                       {updateStatus.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} Aprovar
                      </button>
                      <button
                        disabled={updateStatus.isPending}
                        onClick={() => handleStatusChange(req.profile_id, "banned")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        <XCircle size={13} /> Recusar
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Influencer Directory */}
      <Card className="bg-[#0d0f1a] border-white/5">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <h3 className="font-display font-bold text-white">Diretório de Parceiros</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                placeholder="Buscar influenciador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-xs"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs transition-colors shrink-0">
                  <Filter size={12} /> {filterTier === "all" ? "Tier" : filterTier.charAt(0).toUpperCase() + filterTier.slice(1)} <ChevronDown size={12} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#141828] border-white/10">
                <DropdownMenuItem onClick={() => setFilterTier("all")} className="text-white/70 hover:text-white text-sm">Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterTier("gold")} className="text-[#FFD700] text-sm">Gold</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterTier("silver")} className="text-[#C0C0C0] text-sm">Silver</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterTier("bronze")} className="text-[#CD7F32] text-sm">Bronze</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-white/40 text-sm"><Loader2 size={16} className="animate-spin" /> Carregando diretório...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-white/40 text-xs font-medium">Influenciador</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium">Tier</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium">Status / Win Rate</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium hidden md:table-cell">Adesões</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium hidden lg:table-cell">Receita Gerada</th>
                  <th className="text-right p-4 text-white/40 text-xs font-medium">Status Control</th>
                </tr>
              </thead>
              <tbody>
                {active.map((inf, i) => (
                  <motion.tr key={inf.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-violet flex items-center justify-center text-xs font-bold text-white">{inf.profile.avatar_initials}</div>
                        <div>
                          <p className="text-white font-medium text-sm">{inf.profile.name}</p>
                          <p className="text-white/40 text-xs">{inf.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {inf.tier ? (
                        <Badge className={`text-[10px] border ${tierStyle[inf.tier]} uppercase flex items-center gap-1 w-min`}>
                          <Award size={10} /> {inf.tier}
                        </Badge>
                      ) : <span className="text-white/20 text-xs">—</span>}
                    </td>
                    <td className="p-4">
                      {inf.profile.status === "suspended" ? (
                        <Badge className="bg-red-400/15 text-red-400 border-red-400/20 text-[10px]">Suspenso</Badge>
                      ) : (
                        <div>
                          <p className="text-emerald-400 font-bold text-sm">{inf.accuracy_pct}%</p>
                          <p className="text-white/30 text-[10px]">{inf.hints_count} palpites</p>
                        </div>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell text-white/70 text-sm font-medium">{inf.subscribers.toLocaleString()}</td>
                    <td className="p-4 hidden lg:table-cell text-white font-mono text-sm">R$ {inf.revenue_total.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      {inf.profile.status !== "suspended" ? (
                        <button
                          onClick={() => handleStatusChange(inf.profile_id, "suspended")}
                          className="px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors text-xs font-medium ml-auto flex items-center gap-1"
                        >
                          <Ban size={12} /> Suspender
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(inf.profile_id, "active")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors text-xs font-medium ml-auto flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} /> Reativar
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {active.length === 0 && !isLoading && (
              <div className="text-center py-12 text-white/30 text-sm">Nenhum influenciador encontrado.</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
