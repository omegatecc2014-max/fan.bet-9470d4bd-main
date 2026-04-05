import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Send, ArrowRightLeft, Clock, CheckCircle2, XCircle, 
  RefreshCw, Search, Filter, Eye, User, Coins
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  useCoinTransfers, 
  useAdminProcessCoinTransfer,
  type CoinTransfer 
} from "@/hooks/useCoinTransfers";
import { toast } from "sonner";
import { currencies } from "@/data/currencies";

const statusStyle: Record<string, string> = {
  pending_admin:    "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",
  approved_admin:   "bg-blue-400/15 text-blue-400 border-blue-400/20",
  rejected_admin:  "bg-red-400/15 text-red-400 border-red-400/20",
  completed:       "bg-emerald-400/15 text-emerald-400 border-emerald-400/20",
  rejected_recipient: "bg-red-400/15 text-red-400 border-red-400/20",
};

const statusLabel: Record<string, string> = {
  pending_admin:    "Aprovação Admin",
  approved_admin:  "Aguardando Usuário",
  rejected_admin:  "Rejeitado Admin",
  completed:       "Concluído",
  rejected_recipient: "Rejeitado Usuário",
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function TransfersPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchProtocol, setSearchProtocol] = useState("");
  const [selectedTransfer, setSelectedTransfer] = useState<CoinTransfer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  
  const { data: transfers = [], isLoading, refetch } = useCoinTransfers();
  const processTransfer = useAdminProcessCoinTransfer();

  const filteredTransfers = transfers.filter(t => {
    const statusMatch = filterStatus === "all" || t.status === filterStatus;
    const searchMatch = !searchProtocol || 
      t.protocol?.toLowerCase().includes(searchProtocol.toLowerCase()) ||
      t.sender_name?.toLowerCase().includes(searchProtocol.toLowerCase()) ||
      t.recipient_name?.toLowerCase().includes(searchProtocol.toLowerCase());
    return statusMatch && searchMatch;
  });

  const pendingCount = transfers.filter(t => t.status === "pending_admin").length;
  const completedCount = transfers.filter(t => t.status === "completed").length;

  const handleApprove = async (id: string) => {
    try {
      await processTransfer.mutateAsync({ transferId: id, action: "approve" });
      toast.success("Transferência aprovada!");
      setShowDetailModal(false);
    } catch {
      toast.error("Erro ao aprovar transferência");
    }
  };

  const handleReject = async () => {
    if (!selectedTransfer) return;
    try {
      await processTransfer.mutateAsync({ 
        transferId: selectedTransfer.id, 
        action: "reject",
        adminNotes: adminNotes 
      });
      toast.success("Transferência rejeitada!");
      setShowRejectModal(false);
      setShowDetailModal(false);
      setAdminNotes("");
    } catch {
      toast.error("Erro ao rejeitar transferência");
    }
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0d0f1a] border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Clock size={18} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs">Pendentes</p>
              <p className="font-display font-bold text-white text-xl">{pendingCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-[#0d0f1a] border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs">Concluídas</p>
              <p className="font-display font-bold text-white text-xl">{completedCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-[#0d0f1a] border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
              <Send size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs">Total</p>
              <p className="font-display font-bold text-white text-xl">{transfers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="bg-[#0d0f1a] border-white/5 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <Input 
              placeholder="Buscar por protocolo ou nome..." 
              value={searchProtocol}
              onChange={(e) => setSearchProtocol(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          
          <div className="flex gap-2">
            {["all", "pending_admin", "approved_admin", "completed", "rejected_admin", "rejected_recipient"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filterStatus === status 
                    ? "bg-star text-black" 
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {status === "all" ? "Todos" : statusLabel[status] || status}
              </button>
            ))}
          </div>
        </div>

        {/* Transfer List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12 text-white/40 text-sm">Carregando...</div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-sm">Nenhuma transferência encontrada</div>
          ) : (
            filteredTransfers.map((transfer) => (
              <motion.div
                key={transfer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => { setSelectedTransfer(transfer); setShowDetailModal(true); }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      {transfer.sender_avatar || "S"}
                    </div>
                    <div>
                      <p className="font-display font-bold text-white text-sm">
                        {transfer.sender_name} → {transfer.recipient_name}
                      </p>
                      <p className="text-white/40 text-xs">{formatDate(transfer.created_at)}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] border ${statusStyle[transfer.status]}`}>
                    {statusLabel[transfer.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-white/40 mb-1">Quantidade</p>
                    <p className="font-display font-bold text-purple-400">
                      {transfer.amount} {transfer.currency_type?.toUpperCase()}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-white/40 mb-1">Protocolo</p>
                    <p className="font-mono text-white/60">{transfer.protocol || transfer.id.substring(0, 8)}</p>
                  </div>
                </div>

                {transfer.message && (
                  <p className="text-xs text-white/40 mt-2 italic">"{transfer.message}"</p>
                )}

                {transfer.status === "pending_admin" && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                      onClick={(e) => { e.stopPropagation(); handleApprove(transfer.id); }}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={(e) => { e.stopPropagation(); setSelectedTransfer(transfer); setShowRejectModal(true); }}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-purple-400" />
              Detalhes da Transferência
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
                    {selectedTransfer.sender_avatar || "S"}
                  </div>
                  <div>
                    <p className="font-display font-bold">{selectedTransfer.sender_name}</p>
                    <p className="text-white/40 text-xs">Remetente</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-white/30" />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                    {selectedTransfer.recipient_avatar || "R"}
                  </div>
                  <div>
                    <p className="font-display font-bold">{selectedTransfer.recipient_name}</p>
                    <p className="text-white/40 text-xs">Destinatário</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-1">Quantidade</p>
                  <p className="font-display font-bold text-purple-400 text-lg">
                    {selectedTransfer.amount} {selectedTransfer.currency_type?.toUpperCase()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-1">Status</p>
                  <Badge className={`text-xs border ${statusStyle[selectedTransfer.status]}`}>
                    {statusLabel[selectedTransfer.status]}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
                  <p className="text-white/40 text-xs mb-1">Protocolo</p>
                  <p className="font-mono text-sm">{selectedTransfer.protocol || selectedTransfer.id}</p>
                </div>
              </div>

              {selectedTransfer.message && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs mb-1">Mensagem</p>
                  <p className="text-sm italic">"{selectedTransfer.message}"</p>
                </div>
              )}

              {selectedTransfer.status === "pending_admin" && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleApprove(selectedTransfer.id)}
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
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
              Você está prestes a rejeitar a transferência de <span className="text-white font-bold">{selectedTransfer?.amount} {selectedTransfer?.currency_type}</span> de <span className="text-white font-bold">{selectedTransfer?.sender_name}</span> para <span className="text-white font-bold">{selectedTransfer?.recipient_name}</span>.
            </p>
            
            <div>
              <Label className="text-white/40 text-xs mb-2 block">Motivo (opcional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ex: Saldo insuficiente, usuário bloqueado..."
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
                disabled={processTransfer.isPending}
                className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              >
                {processTransfer.isPending ? "Processando..." : "Confirmar Rejeição"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}