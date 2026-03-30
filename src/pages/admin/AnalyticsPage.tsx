import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Activity, MapPin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { useAnalytics } from "@/hooks/admin/useAnalytics";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f35] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.dataKey === "revenue" ? `R$ ${p.value.toLocaleString()}` : p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const radarData = [
  { subject: 'Engajamento', A: 85, fullMark: 100 },
  { subject: 'Retenção', A: 78, fullMark: 100 },
  { subject: 'Monetização', A: 92, fullMark: 100 },
  { subject: 'Aquisição', A: 65, fullMark: 100 },
  { subject: 'Qualidade (IA)', A: 88, fullMark: 100 },
];

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-32 text-white/40 gap-3">
        <Loader2 size={24} className="animate-spin" /> Carregando métricas avançadas...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CAC Médio", value: "R$ 14,50", change: "-R$ 2,10", up: true, icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "LTV Projetado", value: "R$ 380", change: "+4.5%", up: true, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Sessões / Usuário", value: "4.2", change: "+0.8", up: true, icon: Activity, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Churn Rate", value: "8.4%", change: "-1.2%", up: true, icon: Users, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        ].map((k, i) => (
          <Card key={k.label} className="bg-[#0d0f1a] border-white/5 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}><k.icon size={16} className={k.color} /></div>
                <Badge className={`border-0 text-[10px] ${k.up ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>{k.change}</Badge>
              </div>
              <p className="font-display font-bold text-white text-2xl">{k.value}</p>
              <p className="text-white/40 text-xs mt-1">{k.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-[#0d0f1a] border-white/5 p-5 lg:col-span-2">
           <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-white text-base">Crescimento MoM</h3>
              <p className="text-white/40 text-xs mt-0.5">Evolução de base vs. receita</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyGrowth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v)=>`${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar yAxisId="left" dataKey="users" name="Usuários" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar yAxisId="right" dataKey="revenue" name="Receita" fill="#facc15" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-[#0d0f1a] border-white/5 p-5">
          <h3 className="font-display font-bold text-white text-base">Health Score (Índice Fan.bet)</h3>
          <p className="text-white/40 text-xs mt-0.5 mb-2">Visão geral do ecossistema</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
              <Radar name="Fan.bet" dataKey="A" stroke="#facc15" fill="#facc15" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center">
            <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">Score: 81.6 (Saudável)</Badge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#0d0f1a] border-white/5 py-5 px-0 overflow-hidden">
          <div className="px-5 mb-4">
            <h3 className="font-display font-bold text-white text-base">Retenção de Coorte</h3>
            <p className="text-white/40 text-xs mt-0.5">% de retenção após 1º depósito</p>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-max sm:w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="font-medium text-white/40 pb-3 px-4 text-left border-b border-white/5">Coorte</th>
                  <th className="font-medium text-white/40 pb-3 w-12 border-b border-white/5">M1</th>
                  <th className="font-medium text-white/40 pb-3 w-12 border-b border-white/5">M2</th>
                  <th className="font-medium text-white/40 pb-3 w-12 border-b border-white/5">M3</th>
                  <th className="font-medium text-white/40 pb-3 w-12 border-b border-white/5">M4</th>
                  <th className="font-medium text-white/40 pb-3 w-12 border-b border-white/5">M5</th>
                  <th className="font-medium text-white/40 pb-3 w-12 border-b border-white/5">M6</th>
                </tr>
              </thead>
              <tbody>
                {data.cohort.map((row, i) => (
                  <tr key={i}>
                    <td className="text-white/60 font-medium py-2 px-4 text-left border-b border-white/5">{row.cohort}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="border-b border-white/5 border-l border-white/5">
                        {v !== null ? (
                          <div className="w-full h-full p-2" style={{ backgroundColor: `rgba(52, 211, 153, ${v / 100})` }}>
                            <span className={v < 40 ? "text-white/80" : "text-[#0d0f1a] font-bold"}>{v}%</span>
                          </div>
                        ) : <span className="text-white/10">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-[#0d0f1a] border-white/5 p-5">
          <h3 className="font-display font-bold text-white text-base">Distribuição Geográfica</h3>
          <p className="text-white/40 text-xs mt-0.5 mb-5">Usuários ativos por país</p>
          <div className="space-y-4">
            {data.geoBreakdown.map((geo: any) => (
              <div key={geo.country} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg">{geo.flag}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-white font-medium">{geo.country}</span>
                    <span className="text-white/60">{geo.pct}% ({geo.users.toLocaleString()})</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${geo.pct}%` }} transition={{ duration: 1 }} className="h-full bg-blue-400 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
