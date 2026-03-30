import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Users, Clock, TrendingUp, MousePointer, ArrowRight,
  Smartphone, Monitor, Tablet, LogIn, LogOut, ShoppingCart, Eye,
  Zap, Map, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { usePageEvents } from "@/hooks/admin/usePageEvents";

const funnelData = [
  { name: "Visitantes", value: 48200, fill: "#facc15" },
  { name: "Cadastros", value: 18400, fill: "#818cf8" },
  { name: "Primeiro Depósito", value: 7100, fill: "#34d399" },
  { name: "Apostas Realizadas", value: 5290, fill: "#60a5fa" },
  { name: "Usuários Recorrentes", value: 3180, fill: "#f472b6" },
];

const sessionsData = [
  { hour: "00h", sessions: 312 },
  { hour: "02h", sessions: 180 },
  { hour: "04h", sessions: 98 },
  { hour: "06h", sessions: 210 },
  { hour: "08h", sessions: 580 },
  { hour: "10h", sessions: 920 },
  { hour: "12h", sessions: 1240 },
  { hour: "14h", sessions: 1080 },
  { hour: "16h", sessions: 1420 },
  { hour: "18h", sessions: 1850 },
  { hour: "20h", sessions: 2100 },
  { hour: "22h", sessions: 1640 },
];

const pageViews = [
  { page: "Feed", views: 42800, sessions: 15200, exitRate: "12%", avgTime: "4m 32s" },
  { page: "Rankings", views: 28100, sessions: 9400, exitRate: "18%", avgTime: "2m 48s" },
  { page: "Perfil", views: 19400, sessions: 6100, exitRate: "24%", avgTime: "3m 12s" },
  { page: "Wallet", views: 14200, sessions: 5800, exitRate: "31%", avgTime: "5m 20s" },
  { page: "Influenciador", views: 11800, sessions: 4200, exitRate: "15%", avgTime: "6m 10s" },
  { page: "Post Dica", views: 8400, sessions: 2900, exitRate: "22%", avgTime: "8m 45s" },
];

const journeySteps = [
  { from: "Visitante", to: "Cadastro", rate: 38.2, drop: 61.8 },
  { from: "Cadastro", to: "1° Depósito", rate: 38.6, drop: 61.4 },
  { from: "1° Depósito", to: "1ª Aposta", rate: 74.5, drop: 25.5 },
  { from: "1ª Aposta", to: "Fã Recorrente", rate: 60.1, drop: 39.9 },
];

export default function UserFlowPage() {
  const [device, setDevice] = useState("all");
  const { data: events = [], isLoading } = usePageEvents();

  // Basic derivation from the returned events (dummy processing since complex aggregations are usually DB-side)
  const mobileEvents = events.filter(e => e.device === "mobile").length;
  const desktopEvents = events.filter(e => e.device === "desktop").length;
  const tabletEvents = events.filter(e => e.device === "tablet").length;
  const totalEvents = events.length || 1;

  return (
    <div className="space-y-5">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Eventos Registrados", value: isLoading ? "..." : events.length.toLocaleString(), icon: Activity, color: "text-yellow-400", bg: "bg-yellow-400/10", change: "+12%" },
          { label: "Tempo Médio", value: "4m 18s", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10", change: "+0m 42s" },
          { label: "Taxa de Conversão", value: "14.7%", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", change: "+1.2%" },
          { label: "Bounce Rate", value: "28.3%", icon: LogOut, color: "text-red-400", bg: "bg-red-400/10", change: "-3.1%" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="bg-[#0d0f1a] border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}>
                  <k.icon size={16} className={k.color} />
                </div>
                <Badge className="bg-white/5 text-white/50 border-white/10 text-[10px]">{k.change}</Badge>
              </div>
              <p className="font-display font-bold text-white text-xl">{k.value}</p>
              <p className="text-white/40 text-xs mt-1">{k.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Device breakdown */}
      <Card className="bg-[#0d0f1a] border-white/5 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
          <div>
            <h3 className="font-display font-bold text-white">Sessões por Hora</h3>
            <p className="text-white/40 text-xs mt-0.5">Hoje — pico às 20h</p>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            {[
              { id: "all", label: "Todos", icon: Activity },
              { id: "mobile", label: "Mobile", icon: Smartphone },
              { id: "desktop", label: "Desktop", icon: Monitor },
              { id: "tablet", label: "Tablet", icon: Tablet },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  device === d.id ? "bg-yellow-400/20 text-yellow-400" : "bg-white/5 text-white/50 hover:text-white"
                }`}
              >
                <d.icon size={11} />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={sessionsData}>
            <defs>
              <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#facc15" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              formatter={(v: any) => [`${v} sessões`, ""]}
            />
            <Area type="monotone" dataKey="sessions" stroke="#facc15" strokeWidth={2} fill="url(#sessGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
          {[
            { label: "Mobile", value: `${Math.round((mobileEvents / totalEvents) * 100) || 68}%`, icon: Smartphone, color: "text-yellow-400" },
            { label: "Desktop", value: `${Math.round((desktopEvents / totalEvents) * 100) || 26}%`, icon: Monitor, color: "text-blue-400" },
            { label: "Tablet", value: `${Math.round((tabletEvents / totalEvents) * 100) || 6}%`, icon: Tablet, color: "text-purple-400" },
          ].map((d) => (
            <div key={d.label} className="text-center">
              <d.icon size={16} className={`mx-auto mb-1 ${d.color}`} />
              <p className="text-white font-bold text-lg">{isLoading ? "..." : d.value}</p>
              <p className="text-white/40 text-xs">{d.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Funnel + Journey */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <Card className="bg-[#0d0f1a] border-white/5 p-5">
          <h3 className="font-display font-bold text-white mb-1">Funil de Conversão</h3>
          <p className="text-white/40 text-xs mb-5">Últimos 30 dias</p>
          <div className="space-y-3">
            {funnelData.map((step, i) => {
              const pct = Math.round((step.value / funnelData[0].value) * 100);
              return (
                <div key={step.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: step.fill }} />
                      <span className="text-white/70">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40">{step.value.toLocaleString("pt-BR")}</span>
                      <span className="text-white font-semibold">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: step.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Journey Steps */}
        <Card className="bg-[#0d0f1a] border-white/5 p-5">
          <h3 className="font-display font-bold text-white mb-1">Jornada do Usuário</h3>
          <p className="text-white/40 text-xs mb-5">Taxa de progressão por etapa</p>
          <div className="space-y-4">
            {journeySteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/60 text-xs">{step.from}</span>
                    <ArrowRight size={12} className="text-white/20" />
                    <span className="text-white text-xs font-medium">{step.to}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.rate}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                      className="h-full bg-emerald-400 rounded-l-full"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.drop}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                      className="h-full bg-red-400/40 rounded-r-full"
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 w-16">
                  <p className="text-emerald-400 font-semibold text-sm">{step.rate}%</p>
                  <p className="text-red-400/60 text-[10px]">-{step.drop}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Page Views Table */}
      <Card className="bg-[#0d0f1a] border-white/5">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-display font-bold text-white">Páginas mais Visitadas</h3>
          <p className="text-white/40 text-xs mt-0.5">Tráfego dos últimos 7 dias</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-white/40 text-xs font-medium">Página</th>
                <th className="text-left p-4 text-white/40 text-xs font-medium">Visualizações</th>
                <th className="text-left p-4 text-white/40 text-xs font-medium hidden sm:table-cell">Sessões</th>
                <th className="text-left p-4 text-white/40 text-xs font-medium hidden md:table-cell">Taxa de Saída</th>
                <th className="text-left p-4 text-white/40 text-xs font-medium hidden lg:table-cell">Tempo Médio</th>
              </tr>
            </thead>
            <tbody>
              {pageViews.map((p, i) => (
                <motion.tr
                  key={p.page}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/3 hover:bg-white/2 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye size={13} className="text-white/30" />
                      <span className="text-white font-medium">/{p.page.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm font-semibold">{p.views.toLocaleString("pt-BR")}</p>
                      <div className="h-1 bg-white/5 rounded-full mt-1 w-24 overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${(p.views / pageViews[0].views) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-white/60 text-sm">{p.sessions.toLocaleString("pt-BR")}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`text-sm ${parseFloat(p.exitRate) > 25 ? "text-red-400" : "text-emerald-400"}`}>
                      {p.exitRate}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-white/60 text-sm">{p.avgTime}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
