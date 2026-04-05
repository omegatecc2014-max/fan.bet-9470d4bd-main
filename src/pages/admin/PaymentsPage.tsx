import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, ArrowDownRight, ArrowUpRight, ArrowRightLeft, DollarSign,
  Search, Filter, Download, MoreHorizontal, CheckCircle2,
  XCircle, Clock, AlertTriangle, Eye, Loader2, FileText, User, CreditCardIcon,
  Send, Calendar, Hash, Bell, MessageSquare, ChevronRight, RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTransactions, useApproveTransaction, useRejectTransaction, useSendNotification } from "@/hooks/admin/useTransactions";
import { toast } from "sonner";
import type { Transaction } from "@/lib/database.types";

type ProcessingTab = "pending" | "processing" | "completed" | "history";

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
  cancelled:  "bg-gray-400/15 text-gray-400 border-gray-400/20",
  chargeback: "bg-purple-400/15 text-purple-400 border-purple-400/20",
};
const statusLabel: Record<string, string> = {
  success:"Concluído", pending:"Pendente", failed:"Falhou", cancelled:"Cancelado", chargeback:"Chargeback"
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

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
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
  const [activeTab, setActiveTab] = useState<ProcessingTab>("pending");
  const [searchProtocol, setSearchProtocol] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"info" | "success" | "warning" | "error">("info");
  const [rejectReason, setRejectReason] = useState("");
  const { data: transactions = [], isLoading, refetch } = useTransactions({ status: filterStatus });
  const approveTxn = useApproveTransaction();
  const rejectTxn = useRejectTransaction();
  const sendNotif = useSendNotification();

  const pendingWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "pending");
  const processingWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "pending");
  const completedWithdrawals = transactions.filter(t => t.type === "withdrawal" && (t.status === "success" || t.status === "failed"));
  const allWithdrawals = transactions.filter(t => t.type === "withdrawal");

  const filteredTransactions = allWithdrawals.filter(t => 
    !searchProtocol || t.protocol?.toLowerCase().includes(searchProtocol.toLowerCase()) || 
    t.profile_name?.toLowerCase().includes(searchProtocol.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    try {
      await approveTxn.mutateAsync(id);
      toast.success("Saque aprovado! Notificação enviada ao usuário.");
      setShowDetailModal(false);
    } catch {
      toast.error("Erro ao aprovar transação");
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;
    try {
      await rejectTxn.mutateAsync({ 
        id: selectedTransaction.id, 
        reason: rejectReason 
      });
      toast.success("Saque reprovado! Notificação enviada ao usuário.");
      setShowRejectModal(false);
      setRejectReason("");
      setShowDetailModal(false);
    } catch {
      toast.error("Erro ao reprovar transação");
    }
  };

  const handleSendNotification = async () => {
    if (!selectedTransaction || !notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error("Preencha o título e a mensagem");
      return;
    }
    
    try {
      await sendNotif.mutateAsync({
        userId: selectedTransaction.profile_id,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        transactionId: selectedTransaction.id
      });
      toast.success(`Notificação enviada para ${selectedTransaction.profile_name}!`);
      setShowNotificationModal(false);
      setNotificationTitle("");
      setNotificationMessage("");
    } catch {
      toast.error("Erro ao enviar notificação");
    }
  };

  const getTabCount = (tab: ProcessingTab) => {
    switch(tab) {
      case "pending": return pendingWithdrawals.length;
      case "processing": return processingWithdrawals.length;
      case "completed": return completedWithdrawals.length;
      case "history": return allWithdrawals.length;
    }
  };

  const renderWithdrawalCard = (tx: Transaction) => (
    <motion.div
      key={tx.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
      onClick={() => { setSelectedTransaction(tx); setShowDetailModal(true); }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-star/20 flex items-center justify-center text-star font-bold">
            {tx.profile_avatar}
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm">{tx.profile_name}</p>
            <p className="text-white/40 text-xs">{tx.profile_email || "Email não disponível"}</p>
          </div>
        </div>
        <Badge className={`text-[10px] border ${statusStyle[tx.status]}`}>
          {statusLabel[tx.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2 rounded-lg bg-white/5">
          <p className="text-white/40 mb-1">Protocolo</p>
          <p className="font-mono text-star">{tx.protocol || tx.id.substring(0, 8)}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <p className="text-white/40 mb-1">Valor</p>
          <p className="font-display font-bold text-emerald-400">R$ {tx.amount.toLocaleString("pt-BR")}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <p className="text-white/40 mb-1">Data/Hora</p>
          <p className="text-white/60">{formatDate(tx.created_at)}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <p className="text-white/40 mb-1">Chave PIX</p>
          <p className="font-mono text-white/60 text-[10px] truncate">{tx.pix_key || "N/A"}</p>
        </div>
      </div>

      {tx.converted_currency && (
        <div className="mt-3 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-[10px] text-purple-400">
            Convertido: {tx.converted_amount} {tx.converted_currency?.toUpperCase()} → Taxa: R$ {tx.conversion_rate}
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        {tx.status === "pending" && (
          <>
            <Button 
              size="sm" 
              className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
              onClick={(e) => { e.stopPropagation(); handleApprove(tx.id); }}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Aprovar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={(e) => { e.stopPropagation(); setSelectedTransaction(tx); setShowRejectModal(true); }}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Rejeitar
            </Button>
          </>
        )}
        <Button 
          size="sm" 
          variant="outline"
          className="border-white/10 text-white/60 hover:bg-white/5"
          onClick={(e) => { e.stopPropagation(); setSelectedTransaction(tx); setShowNotificationModal(true); }}
        >
          <Bell className="w-3 h-3 mr-1" />
          Notificar
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-5">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Volume (30d)",   value: "R$ 410k", change: "+12.5%", up: true,  icon: DollarSign, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Receita Líquida",value: "R$ 145k", change: "+8.2%",  up: true,  icon: ArrowUpRight, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Saques Pendentes",value: pendingWithdrawals.length,  change: "reqs", up: false, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
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

      {/* Processing Tabs */}
      <Card className="bg-[#0d0f1a] border-white/5 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-star" />
            Processamento de Saques
          </h3>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(["pending", "processing", "completed", "history"] as ProcessingTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? "bg-star text-black" 
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {tab === "pending" && <Clock className="w-4 h-4" />}
              {tab === "processing" && <ArrowRightLeft className="w-4 h-4" />}
              {tab === "completed" && <CheckCircle2 className="w-4 h-4" />}
              {tab === "history" && <FileText className="w-4 h-4" />}
              {tab === "pending" ? "Pendentes" : 
               tab === "processing" ? "Processando" : 
               tab === "completed" ? "Concluídos" : "Histórico"}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab ? "bg-black/20" : "bg-white/10"
              }`}>
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Search by Protocol */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <Input 
            placeholder="Buscar por protocolo, nome ou email..." 
            value={searchProtocol}
            onChange={(e) => setSearchProtocol(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        {/* Transaction List by Tab */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12 gap-2 text-white/40 text-sm">
              <Loader2 className="animate-spin" size={16} /> Carregando...
            </div>
          ) : activeTab === "pending" && filteredTransactions.filter(t => t.status === "pending").length === 0 ? (
            <div className="text-center py-12 text-white/40 text-sm">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              Nenhum saque pendente
            </div>
          ) : activeTab === "completed" && filteredTransactions.filter(t => t.status === "success" || t.status === "failed").length === 0 ? (
            <div className="text-center py-12 text-white/40 text-sm">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              Nenhum saque concluído
            </div>
          ) : (
            filteredTransactions
              .filter(t => {
                if (activeTab === "pending") return t.status === "pending";
                if (activeTab === "completed") return t.status === "success" || t.status === "failed";
                return true;
              })
              .slice(0, 20)
              .map(renderWithdrawalCard)
          )}
        </div>
      </Card>

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

      {/* Transaction Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-star" />
              Detalhes do Saque
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm">
              Protocolo: {selectedTransaction?.protocol || selectedTransaction?.id?.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* User Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-star/20 flex items-center justify-center text-star font-bold text-lg">
                    {selectedTransaction.profile_avatar}
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">{selectedTransaction.profile_name}</p>
                    <p className="text-white/40 text-sm">{selectedTransaction.profile_email || "Email não disponível"}</p>
                    {selectedTransaction.profile_document && (
                      <p className="text-white/40 text-xs">CPF: {selectedTransaction.profile_document}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Protocolo
                  </p>
                  <p className="font-mono text-sm text-star">{selectedTransaction.protocol || "N/A"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Data/Hora
                  </p>
                  <p className="font-display text-sm">{formatDate(selectedTransaction.created_at)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-1">Valor Solicitado</p>
                  <p className="font-display font-bold text-emerald-400 text-lg">R$ {selectedTransaction.amount.toLocaleString("pt-BR")}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-1">Status</p>
                  <Badge className={`text-xs border ${statusStyle[selectedTransaction.status]}`}>
                    {statusLabel[selectedTransaction.status]}
                  </Badge>
                </div>
              </div>

              {/* PIX Data */}
              {selectedTransaction.pix_key && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="font-display font-bold text-sm text-blue-400 mb-3 flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4" />
                    Dados doPIX
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Chave PIX:</span>
                      <span className="font-mono">{selectedTransaction.pix_key}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Tipo:</span>
                      <span className="uppercase">{selectedTransaction.pix_key_type || "CPF"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Titular:</span>
                      <span>{selectedTransaction.pix_recipient_name}</span>
                    </div>
                    {selectedTransaction.pix_recipient_bank && (
                      <div className="flex justify-between">
                        <span className="text-white/40">Banco:</span>
                        <span>{selectedTransaction.pix_recipient_bank}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Conversion Data */}
              {selectedTransaction.converted_currency && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="font-display font-bold text-sm text-purple-400 mb-3 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    Dados da Conversão
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Moeda:</span>
                      <span className="uppercase">{selectedTransaction.converted_currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Quantidade:</span>
                      <span>{selectedTransaction.converted_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Taxa:</span>
                      <span>R$ {selectedTransaction.conversion_rate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Info */}
              {(selectedTransaction.processed_by || selectedTransaction.processed_at) && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-2">Informações do Processamento</p>
                  <div className="space-y-1 text-sm">
                    {selectedTransaction.processed_by && (
                      <p><span className="text-white/40">Por:</span> {selectedTransaction.processed_by}</p>
                    )}
                    {selectedTransaction.processed_at && (
                      <p><span className="text-white/40">Em:</span> {formatDate(selectedTransaction.processed_at)}</p>
                    )}
                    {selectedTransaction.admin_notes && (
                      <p><span className="text-white/40">Notas:</span> {selectedTransaction.admin_notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedTransaction.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => { handleApprove(selectedTransaction.id); }}
                    className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}

              <Button 
                onClick={() => { setSelectedTransaction(selectedTransaction); setShowNotificationModal(true); }}
                variant="outline"
                className="w-full border-white/20 text-white/60 hover:bg-white/5"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enviar Notificação
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" />
              Confirmar Rejeição
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              Você está prestes a rejeitar o saque de <span className="text-white font-bold">R$ {selectedTransaction?.amount.toLocaleString("pt-BR")}</span> para <span className="text-white font-bold">{selectedTransaction?.profile_name}</span>.
            </p>
            
            <div>
              <Label className="text-white/40 text-xs mb-2 block">Motivo da rejeição (opcional)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Dados PIX inválidos, saldo insuficiente..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white/60 hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleReject}
                disabled={rejectTxn.isPending}
                className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              >
                {rejectTxn.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar Rejeição
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Notification Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-star" />
              Enviar Notificação
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm">
              Enviar mensagem para: {selectedTransaction?.profile_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white/40 text-xs mb-2 block">Tipo de notificação</Label>
              <div className="flex gap-2">
                {(["info", "success", "warning", "error"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNotificationType(type)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      notificationType === type 
                        ? type === "info" ? "bg-blue-500/20 text-blue-400" :
                          type === "success" ? "bg-emerald-500/20 text-emerald-400" :
                          type === "warning" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {type === "info" ? "Info" : 
                     type === "success" ? "Sucesso" : 
                     type === "warning" ? "Alerta" : "Erro"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white/40 text-xs mb-2 block">Título</Label>
              <Input
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Ex: Saque aprovado, Atualização needed..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              />
            </div>

            <div>
              <Label className="text-white/40 text-xs mb-2 block">Mensagem</Label>
              <Textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Digite a mensagem para o usuário..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => setShowNotificationModal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white/60 hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendNotification}
                className="flex-1 gradient-star text-primary-foreground font-display font-bold"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}