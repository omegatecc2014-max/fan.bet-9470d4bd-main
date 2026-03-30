import { motion } from "framer-motion";
import {
  Users, CreditCard, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight,
  Star, Activity, Zap, Eye, Loader2, AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const revenueData = [
  { day: "Seg", revenue: 12400, users: 340 },
  { day: "Ter", revenue: 18200, users: 520 },
  { day: "Qua", revenue: 15800, users: 410 },
  { day: "Qui", revenue: 22100, users: 680 },
  { day: "Sex", revenue: 31000, users: 920 },
  { day: "Sáb", revenue: 28500, users: 810 },
  { day: "Dom", revenue: 19700, users: 560 },
];

const topInfluencers = [
  { name: "CruzeiroBR", followers: "245k", revenue: "R$ 12.4k", growth: 18, avatar: "C" },
  { name: "FlaBR",      followers: "318k", revenue: "R$ 18.9k", growth: 24, avatar: "F" },
  { name: "PalmeirasTV",followers: "198k", revenue: "R$ 9.2k",  growth: 12, avatar: "P" },
  { name: "GremioFan",  followers: "142k", revenue: "R$ 6.8k",  growth: -3, avatar: "G" },
];

const recentAlerts = [
  { type: "warning", message: "Conteúdo suspeito reportado por 3 usuários", time: "2m", icon: ShieldCheck },
  { type: "success", message: "Pagamento de R$ 4.200 processado com sucesso", time: "8m", icon: CreditCard },
  { type: "info",    message: "Novo influenciador solicitou verificação",       time: "15m", icon: Star },
  { type: "warning", message: "Taxa de chargeback acima do limite (2.1%)",     time: "32m", icon: TrendingUp },
  { type: "error",   message: "Tentativa de fraude bloqueada — IP 177.xx.xx.xx","time": "1h", icon: Zap },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1f35] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.dataKey === "revenue" ? `R$ ${p.value.toLocaleString("pt-BR")}` : `${p.value} usuários`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useAdminStats();

  const kpis = [
    {
      label: "Usuários Ativos",
      value: isLoading ? "..." : stats ? stats.active_users.toLocaleString("pt-BR") : "—",
      change: stats ? `+${stats.new_users_7d} novos` : "+0",
      up: true, icon: Users, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400", sub: "últimos 7 dias",
    },
    {
      label: "Receita (7d)",
      value: isLoading ? "..." : stats ? `R$ ${(stats.revenue_7d / 1000).toFixed(0)}k` : "—",
      change: "+14.5%", up: true, icon: CreditCard, color: "from-yellow-400/20 to-yellow-500/5", iconColor: "text-yellow-400", sub: "vs. semana passada",
    },
    {
      label: "Conteúdo em Revisão",
      value: isLoading ? "..." : stats ? stats.pending_moderation.toString() : "—",
      change: "pendentes", up: true, icon: ShieldCheck, color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400", sub: "aguardando revisão",
    },
    {
      label: "Influenciadores",
      value: isLoading ? "..." : stats ? stats.total_influencers.toString() : "—",
      change: "+7", up: true, icon: Star, color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400", sub: "ativos este mês",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
          <AlertCircle size={15} /> Falha ao carregar dados do Supabase — exibindo dados locais
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} {...fadeUp(i * 0.05)}>
            <Card className={`bg-gradient-to-br ${kpi.color} border-white/5 p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${kpi.iconColor}`}>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <kpi.icon size={18} />}
                </div>
                <Badge className={`text-[10px] border-0 ${kpi.up ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>
                  {kpi.up ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                  {kpi.change}
                </Badge>
              </div>
              <p className="font-display font-bold text-2xl text-white">{kpi.value}</p>
              <p className="text-white/50 text-xs mt-1">{kpi.label}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{kpi.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div {...fadeUp(0.2)} className="xl:col-span-2">
          <Card className="bg-[#0d0f1a] border-white/5 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-white text-base">Receita & Usuários</h3>
                <p className="text-white/40 text-xs mt-0.5">Últimos 7 dias</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Receita</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Usuários</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#facc15" stopOpacity={0.3} /><stop offset="100%" stopColor="#facc15" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} /><stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#facc15" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                <Area type="monotone" dataKey="users"   stroke="#60a5fa" strokeWidth={2} fill="url(#userGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp(0.25)}>
          <Card className="bg-[#0d0f1a] border-white/5 p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white text-base">Top Influenciadores</h3>
              <span className="text-yellow-400 text-xs font-medium cursor-pointer hover:text-yellow-300">Ver todos</span>
            </div>
            <div className="space-y-3">
              {topInfluencers.map((inf, i) => (
                <div key={inf.name} className="flex items-center gap-3">
                  <span className="text-white/20 text-xs w-4 font-mono">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{inf.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{inf.name}</p>
                    <p className="text-white/30 text-[10px]">{inf.followers}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-xs font-semibold">{inf.revenue}</p>
                    <p className={`text-[10px] ${inf.growth > 0 ? "text-emerald-400" : "text-red-400"}`}>{inf.growth > 0 ? "+" : ""}{inf.growth}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div {...fadeUp(0.3)}>
          <Card className="bg-[#0d0f1a] border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white text-base">Alertas Recentes</h3>
              <Badge className="bg-red-400/15 text-red-400 border-0 text-[10px]">2 críticos</Badge>
            </div>
            <div className="space-y-2">
              {recentAlerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.type === "warning" ? "bg-yellow-400/15 text-yellow-400" :
                    alert.type === "success" ? "bg-emerald-400/15 text-emerald-400" :
                    alert.type === "error"   ? "bg-red-400/15 text-red-400" : "bg-blue-400/15 text-blue-400"
                  }`}><alert.icon size={13} /></div>
                  <p className="text-white/70 text-xs flex-1">{alert.message}</p>
                  <span className="text-white/25 text-[10px] flex-shrink-0">{alert.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp(0.35)}>
          <Card className="bg-[#0d0f1a] border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white text-base">Saúde da Plataforma</h3>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Operacional
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Uptime",                  value: 99.9, color: "bg-emerald-400" },
                { label: "Taxa de Conversão",        value: 68,   color: "bg-yellow-400" },
                { label: "Satisfação dos Usuários",  value: 84,   color: "bg-blue-400" },
                { label: "Aprovação de Conteúdo",    value: 91,   color: "bg-purple-400" },
                { label: "Sucesso de Pagamento",     value: 97.8, color: "bg-emerald-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-white font-semibold">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 0.8, delay: 0.4 }}
                      className={`h-full rounded-full ${item.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
