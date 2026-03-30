import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, ArrowDownRight, ArrowUpRight, DollarSign,
  Search, Filter, Download, MoreHorizontal, CheckCircle2,
  XCircle, Clock, AlertTriangle, Eye, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTransactions, useApproveTransaction } from "@/hooks/admin/useTransactions";
import { toast } from "sonner";

const monthlyFlow = [
  { name: "Jan", inc: 42000, out: 18000 },
  { name: "Fev", inc: 58000, out: 24000 },
  { name: "Mar", inc: 49000, out: 21000 },
  { name: "Abr", inc: 65000, out: 28000 },
  { name: "Mai", inc: 84000, out: 35000 },
  { name: "Jun", inc: 112000, out: 42000 },
];

const paymentMethods = [
  { name: "PIX", value: 75, color: "#34d399" },
  { name: "Cartão", value: 15, color: "#60a5fa" },
  { name: "TED", value: 10, color: "#facc15" },
];

const statusStyle: Record<string, string> = {
  success:    "bg-emerald-400/15 text-emerald-400 border-emerald-400/20",
  pending:    "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",
  failed:     "bg-red-400/15 text-red-400 border-red-400/20",
  chargeback: "bg-purple-400/15 text-purple-400 border-purple-400/20",
};
const statusLabel: Record<string, string> = {
  success:"Concluído", pending:"Pendente", failed:"Falhou", chargeback:"Chargeback"
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f35] border border-white/10 p-3 rounded-lg shadow-xl text-xs">
        <p className="text-white/60 mb-2">{label}</p>
        <p className="text-emerald-400 font-semibold mb-1">Entradas: R$ {payload[0].value.toLocaleString()}</p>
        <p className="text-red-400 font-semibold">Saídas: R$ {payload[1].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
};

export default function PaymentsPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: transactions = [], isLoading } = useTransactions({ status: filterStatus });
  const approveTxn = useApproveTransaction();

  const handleApprove = async (id: string) => {
    try {
      await approveTxn.mutateAsync(id);
      toast.success("Transação aprovada com sucesso");
    } catch {
      toast.error("Erro ao aprovar transação");
    }
  };

  return (
    <div className="space-y-5">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Volume (30d)",   value: "R$ 410k", change: "+12.5%", up: true,  icon: DollarSign, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Receita Líquida",value: "R$ 145k", change: "+8.2%",  up: true,  icon: ArrowUpRight, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Saques Pendentes",value: "R$ 18k",  change: "24 reqs", up: false, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Furos/Chargeback",value: "1.2%",   change: "-0.4%",  up: true,  icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-[#0d0f1a] border-white/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs mb-1">{k.label}</p>
                <p className="font-display font-bold text-white text-xl">{k.value}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px]">
                  <span className={k.up ? "text-emerald-400" : "text-red-400"}>{k.change}</span>
                  <span className="text-white/30">vs. mês ant.</span>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}>
                <k.icon size={18} className={k.color} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-[#0d0f1a] border-white/5 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-white text-base">Fluxo de Caixa</h3>
              <p className="text-white/40 text-xs mt-0.5">Entradas x Saídas (6 meses)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyFlow} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(val) => `R$${val / 1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="inc" fill="#34d399" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="out" fill="#f87171" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-[#0d0f1a] border-white/5 p-5">
          <h3 className="font-display font-bold text-white text-base">Métodos de Pagamento</h3>
          <p className="text-white/40 text-xs mt-0.5 mb-6">Distribuição de volume</p>
          <div className="flex justify-center mb-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={paymentMethods} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {paymentMethods.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "12px", color: "white" }}
                  formatter={(val: number) => [`${val}%`, "Volume"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((m) => (
              <div key={m.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-white/60">{m.name}</span>
                </div>
                <span className="text-white font-medium">{m.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-[#0d0f1a] border-white/5">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-white">Transações Recentes</h3>
            <p className="text-white/40 text-xs mt-0.5">Depósitos, saques e chargebacks</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input placeholder="Buscar ID ou usuário..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-xs" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors">
                  <Filter size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#141828] border-white/10 text-xs w-40">
                <DropdownMenuItem onClick={()=>setFilterStatus("all")} className="text-white/70 hover:text-white">Todos</DropdownMenuItem>
                {Object.entries(statusLabel).map(([k,v])=>(
                  <DropdownMenuItem key={k} onClick={()=>setFilterStatus(k)} className="text-white/70 hover:text-white">{v}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 transition-colors text-xs font-medium shrink-0">
              <Download size={14} /> Exportar
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16 gap-2 text-white/40 text-sm">
            <Loader2 className="animate-spin" size={16} /> Carregando transações...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-white/40 text-xs font-medium">ID / Data</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium">Usuário</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium">Tipo</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium">Método</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium">Valor</th>
                  <th className="text-left p-4 text-white/40 text-xs font-medium">Status</th>
                  <th className="text-right p-4 text-white/40 text-xs font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-mono text-xs">{tx.id.split('-')[1]?.substring(0,6) || tx.id.substring(0,8)}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{timeAgo(tx.created_at)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                          {tx.profile_avatar}
                        </div>
                        <span className="text-white/80 text-xs font-medium">{tx.profile_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${tx.type === "deposit" ? "text-emerald-400" : "text-blue-400"}`}>
                        {tx.type === "deposit" ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                        {tx.type === "deposit" ? "Depósito" : "Saque"}
                      </div>
                    </td>
                    <td className="p-4 text-white/60 text-xs">{tx.method}</td>
                    <td className="p-4 font-mono text-white text-xs font-semibold">R$ {tx.amount.toLocaleString("pt-BR")}</td>
                    <td className="p-4">
                      <Badge className={`text-[10px] border ${statusStyle[tx.status]}`}>{statusLabel[tx.status]}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      {tx.status === "pending" && tx.type === "withdrawal" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(tx.id)}
                            disabled={approveTxn.isPending}
                            className="w-7 h-7 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                          >
                            {approveTxn.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 flex items-center justify-center transition-colors shadow-sm">
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors ml-auto">
                          <Eye size={14} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">Nenhuma transação encontrada.</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
