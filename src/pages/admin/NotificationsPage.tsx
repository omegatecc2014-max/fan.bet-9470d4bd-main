import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Send, Plus, Eye, Trash2, X, Filter, Loader2,
  Users, UserCheck, Star, AlertCircle, CheckCircle,
  XCircle, Info, AlertTriangle, Clock, EyeOff, Mail
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
import {
  useNotifications,
  useCreateNotification,
  useSendNotification,
  useCancelNotification,
  useDeleteNotification,
  useNotificationDelivery,
  useNotificationStats,
} from "@/hooks/admin/useNotifications";
import { FN_LIST_NOTIFICATIONS } from "@/lib/db/functions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Notification, UserNotification, NotificationStats } from "@/lib/database.types";

const typeConfig: Record<string, { icon: typeof Info; color: string; label: string }> = {
  info:    { icon: Info,          color: "text-blue-400",    label: "Info" },
  success: { icon: CheckCircle,  color: "text-emerald-400", label: "Sucesso" },
  warning: { icon: AlertTriangle,color: "text-yellow-400",  label: "Aviso" },
  error:   { icon: XCircle,      color: "text-red-400",     label: "Erro" },
  system:  { icon: AlertCircle,  color: "text-purple-400",  label: "Sistema" },
};

const targetConfig: Record<string, { icon: typeof Users; label: string }> = {
  all:            { icon: Users,       label: "Todos os usuários" },
  influencers:    { icon: Star,        label: "Influenciadores" },
  fans:          { icon: UserCheck,   label: "Fãs" },
  specific_users: { icon: Mail,        label: "Usuários específicos" },
};

const statusColor: Record<string, string> = {
  draft:     "bg-gray-400/15 text-gray-400 border-gray-400/20",
  sent:       "bg-emerald-400/15 text-emerald-400 border-emerald-400/20",
  cancelled:  "bg-red-400/15 text-red-400 border-red-400/20",
};

const statusLabel: Record<string, string> = {
  draft: "Rascunho", sent: "Enviada", cancelled: "Cancelada",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function NotificationsPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTarget, setFilterTarget] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newType, setNewType] = useState("info");
  const [newTargetType, setNewTargetType] = useState("all");
  const [newTargetUsers, setNewTargetUsers] = useState("");
  const [sendNow, setSendNow] = useState(false);

  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications({
    status: filterStatus === "all" ? undefined : filterStatus,
    target_type: filterTarget === "all" ? undefined : filterTarget,
  });

  const { data: deliveryData = [] } = useNotificationDelivery(selectedNotif?.id || null);
  const { data: statsData } = useNotificationStats(selectedNotif?.id || null);

  const createMut = useCreateNotification();
  const sendMut = useSendNotification();
  const cancelMut = useCancelNotification();
  const deleteMut = useDeleteNotification();

  const handleCreate = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      toast.error("Preencha o título e a mensagem");
      return;
    }
    try {
      await createMut.mutateAsync({
        title: newTitle,
        message: newMessage,
        type: newType,
        target_type: newTargetType,
        target_value: newTargetType === "specific_users" ? newTargetUsers : undefined,
        send_now: sendNow,
      });
      toast.success(sendNow ? "Notificação criada e enviada!" : "Rascunho salvo!");
      setIsCreateOpen(false);
      resetForm();
    } catch {
      toast.error("Erro ao criar notificação");
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendMut.mutateAsync(id);
      toast.success("Notificação enviada!");
    } catch {
      toast.error("Erro ao enviar");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancelar esta notificação?")) return;
    try {
      await cancelMut.mutateAsync(id);
      toast.success("Notificação cancelada");
    } catch {
      toast.error("Erro ao cancelar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta notificação?")) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Notificação excluída");
      setIsDetailOpen(false);
      setSelectedNotif(null);
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const resetForm = () => {
    setNewTitle("");
    setNewMessage("");
    setNewType("info");
    setNewTargetType("all");
    setNewTargetUsers("");
    setSendNow(false);
  };

  const openDetail = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsDetailOpen(true);
  };

  const sentCount = notifications.filter(n => n.status === "sent").length;
  const draftCount = notifications.filter(n => n.status === "draft").length;
  const totalRead = notifications.reduce((acc, n) => acc + n.read_count, 0);
  const totalRecipients = notifications.reduce((acc, n) => acc + n.total_recipients, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0d0f1a] border-white/5 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
            <Send size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">{sentCount}</p>
            <p className="text-white/40 text-xs">Enviadas</p>
          </div>
        </Card>
        <Card className="bg-[#0d0f1a] border-white/5 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
            <Clock size={16} className="text-yellow-400" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">{draftCount}</p>
            <p className="text-white/40 text-xs">Rascunhos</p>
          </div>
        </Card>
        <Card className="bg-[#0d0f1a] border-white/5 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
            <Eye size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">{totalRead.toLocaleString("pt-BR")}</p>
            <p className="text-white/40 text-xs">Visualizações</p>
          </div>
        </Card>
        <Card className="bg-[#0d0f1a] border-white/5 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
            <Users size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">{totalRecipients.toLocaleString("pt-BR")}</p>
            <p className="text-white/40 text-xs">Recipients</p>
          </div>
        </Card>
      </div>

      <Card className="bg-[#0d0f1a] border-white/5 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white/60 text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#141828] border-white/10">
              <SelectItem value="all" className="text-white/70 text-xs">Todos status</SelectItem>
              <SelectItem value="sent" className="text-white/70 text-xs">Enviadas</SelectItem>
              <SelectItem value="draft" className="text-white/70 text-xs">Rascunhos</SelectItem>
              <SelectItem value="cancelled" className="text-white/70 text-xs">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTarget} onValueChange={setFilterTarget}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white/60 text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#141828] border-white/10">
              <SelectItem value="all" className="text-white/70 text-xs">Todos alvos</SelectItem>
              <SelectItem value="all_users" className="text-white/70 text-xs">Todos</SelectItem>
              <SelectItem value="influencers" className="text-white/70 text-xs">Influenciadores</SelectItem>
              <SelectItem value="fans" className="text-white/70 text-xs">Fãs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-yellow-400 text-black hover:bg-yellow-500 text-xs h-9 gap-2"
        >
          <Plus size={14} /> Nova Notificação
        </Button>
      </Card>

      <Card className="bg-[#0d0f1a] border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-white/40">
            <Loader2 size={18} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif, i) => {
              const type = typeConfig[notif.type] || typeConfig.info;
              const target = targetConfig[notif.target_type] || targetConfig.all;
              const TypeIcon = type.icon;
              const TargetIcon = target.icon;
              const readRate = notif.total_recipients > 0 ? Math.round((notif.read_count / notif.total_recipients) * 100) : 0;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 hover:bg-white/2 transition-colors cursor-pointer"
                  onClick={() => openDetail(notif)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 ${type.color}`}>
                      <TypeIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-medium text-sm">{notif.title}</h3>
                        <Badge className={`text-[10px] border ${statusColor[notif.status]}`}>
                          {statusLabel[notif.status]}
                        </Badge>
                      </div>
                      <p className="text-white/50 text-xs mt-1 line-clamp-1">{notif.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-white/40 text-xs">
                        <span className="flex items-center gap-1">
                          <TargetIcon size={12} />
                          {target.label}
                        </span>
                        <span>{formatDate(notif.created_at)}</span>
                        {notif.status === "sent" && (
                          <>
                            <span>{notif.total_recipients.toLocaleString("pt-BR")} recipients</span>
                            <span className="text-emerald-400">{readRate}% lido</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">
                Nenhuma notificação encontrada
              </div>
            )}
          </div>
        )}
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bell size={18} className="text-yellow-400" />
              Nova Notificação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Título</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Manutenção programada"
                className="bg-white/5 border-white/10 text-white text-sm h-10"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Mensagem</label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite a mensagem que será enviada..."
                className="bg-white/5 border-white/10 text-white text-sm min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Tipo</label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141828] border-white/10">
                    <SelectItem value="info" className="text-white/70 text-xs">Info</SelectItem>
                    <SelectItem value="success" className="text-white/70 text-xs">Sucesso</SelectItem>
                    <SelectItem value="warning" className="text-white/70 text-xs">Aviso</SelectItem>
                    <SelectItem value="error" className="text-white/70 text-xs">Erro</SelectItem>
                    <SelectItem value="system" className="text-white/70 text-xs">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Destinatários</label>
                <Select value={newTargetType} onValueChange={setNewTargetType}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141828] border-white/10">
                    <SelectItem value="all" className="text-white/70 text-xs">Todos os usuários</SelectItem>
                    <SelectItem value="influencers" className="text-white/70 text-xs">Influenciadores</SelectItem>
                    <SelectItem value="fans" className="text-white/70 text-xs">Fãs</SelectItem>
                    <SelectItem value="specific_users" className="text-white/70 text-xs">Usuários específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newTargetType === "specific_users" && (
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">IDs dos usuários (separados por vírgula)</label>
                <Input
                  value={newTargetUsers}
                  onChange={(e) => setNewTargetUsers(e.target.value)}
                  placeholder="uuid1, uuid2, uuid3"
                  className="bg-white/5 border-white/10 text-white text-sm h-10"
                />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendNow}
                onChange={(e) => setSendNow(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20"
              />
              <span className="text-white/60 text-xs">Enviar imediatamente após criar</span>
            </label>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setIsCreateOpen(false); resetForm(); }} className="text-white/60 h-9 text-xs">
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMut.isPending}
              className="bg-yellow-400 text-black hover:bg-yellow-500 h-9 text-xs gap-2"
            >
              {createMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sendNow ? "Criar e Enviar" : "Salvar Rascunho"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-yellow-400" />
                Detalhes da Notificação
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </DialogTitle>
          </DialogHeader>

          {selectedNotif && (
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className={`text-xs border ${statusColor[selectedNotif.status]}`}>
                    {statusLabel[selectedNotif.status]}
                  </Badge>
                  <Badge className={`text-xs border ${typeConfig[selectedNotif.type]?.color} bg-white/5 border-white/10`}>
                    {typeConfig[selectedNotif.type]?.label}
                  </Badge>
                </div>
                <h3 className="text-white font-semibold text-lg">{selectedNotif.title}</h3>
                <p className="text-white/70 text-sm">{selectedNotif.message}</p>
                <div className="flex items-center gap-4 text-white/40 text-xs pt-2 border-t border-white/5">
                  <span>Enviado por: {selectedNotif.sent_by}</span>
                  <span>{formatDate(selectedNotif.created_at)}</span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {targetConfig[selectedNotif.target_type]?.label || selectedNotif.target_type}
                  </span>
                </div>
              </div>

              {selectedNotif.status === "sent" && statsData && (
                <div className="grid grid-cols-4 gap-3">
                  <Card className="bg-white/5 border-white/10 p-3 text-center">
                    <p className="text-white/40 text-xs">Total</p>
                    <p className="text-white font-bold text-lg">{statsData.total_recipients.toLocaleString("pt-BR")}</p>
                  </Card>
                  <Card className="bg-white/5 border-white/10 p-3 text-center">
                    <p className="text-white/40 text-xs">Entregue</p>
                    <p className="text-emerald-400 font-bold text-lg">{statsData.delivered_count.toLocaleString("pt-BR")}</p>
                  </Card>
                  <Card className="bg-white/5 border-white/10 p-3 text-center">
                    <p className="text-white/40 text-xs">Lido</p>
                    <p className="text-blue-400 font-bold text-lg">{statsData.read_count.toLocaleString("pt-BR")}</p>
                  </Card>
                  <Card className="bg-white/5 border-white/10 p-3 text-center">
                    <p className="text-white/40 text-xs">Taxa de Leitura</p>
                    <p className="text-yellow-400 font-bold text-lg">{statsData.read_rate.toFixed(1)}%</p>
                  </Card>
                </div>
              )}

              {selectedNotif.status === "sent" && deliveryData.length > 0 && (
                <div>
                  <h4 className="text-white/60 text-xs font-medium mb-2">Status de Entrega</h4>
                  <div className="bg-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left p-3 text-white/40 font-medium">Usuário</th>
                          <th className="text-left p-3 text-white/40 font-medium">E-mail</th>
                          <th className="text-center p-3 text-white/40 font-medium">Entregue</th>
                          <th className="text-center p-3 text-white/40 font-medium">Lido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveryData.map((item: UserNotification) => (
                          <tr key={item.id} className="border-b border-white/5 last:border-0">
                            <td className="p-3 text-white/70">{item.user_name}</td>
                            <td className="p-3 text-white/40">{item.user_email}</td>
                            <td className="p-3 text-center">
                              {item.delivered ? (
                                <CheckCircle size={14} className="inline text-emerald-400" />
                              ) : (
                                <XCircle size={14} className="inline text-red-400" />
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {item.read ? (
                                <span className="flex items-center justify-center gap-1 text-blue-400">
                                  <Eye size={14} /> {item.read_at ? formatDate(item.read_at) : ""}
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-1 text-white/30">
                                  <EyeOff size={14} /> Não
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t border-white/5">
            {selectedNotif?.status === "draft" && (
              <>
                <Button
                  onClick={() => handleSend(selectedNotif!.id)}
                  disabled={sendMut.isPending}
                  className="bg-emerald-400 text-black hover:bg-emerald-500 h-9 text-xs gap-2"
                >
                  <Send size={14} /> Enviar
                </Button>
                <Button
                  onClick={() => handleCancel(selectedNotif!.id)}
                  disabled={cancelMut.isPending}
                  className="bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 h-9 text-xs gap-2"
                >
                  <X size={14} /> Cancelar
                </Button>
              </>
            )}
            <Button
              onClick={() => handleDelete(selectedNotif!.id)}
              disabled={deleteMut.isPending}
              className="bg-red-400/20 text-red-400 hover:bg-red-400/30 h-9 text-xs gap-2 ml-auto"
            >
              <Trash2 size={14} /> Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
