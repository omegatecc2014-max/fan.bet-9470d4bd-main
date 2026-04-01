import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Shield, Eye, EyeOff, Lock, Smartphone, Key,
  Monitor, Clock, MapPin, Users, Search, Download, MessageSquare,
  TrendingUp, History, LogOut, AlertTriangle, Check, X, ChevronRight,
  Smartphone as MobileIcon, Globe, UserX, RefreshCw, ShieldCheck, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  usePrivacySettings, useUpdatePrivacySettings
} from "@/hooks/usePrivacySettings";
import {
  useSecuritySettings, useUpdateSecuritySettings,
  useUserSessions, useTerminateSession, useTerminateAllSessions,
  useLoginHistory
} from "@/hooks/useSecuritySettings";

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export default function PrivacySecurityPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"privacy" | "security" | "sessions" | "blocked">("privacy");
  const [isTerminateAllOpen, setIsTerminateAllOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data: privacySettings } = usePrivacySettings();
  const { data: securitySettings } = useSecuritySettings();
  const { data: sessions = [] } = useUserSessions();
  const { data: loginHistory = [] } = useLoginHistory();

  const updatePrivacy = useUpdatePrivacySettings();
  const updateSecurity = useUpdateSecuritySettings();
  const terminateSession = useTerminateSession();
  const terminateAllSessions = useTerminateAllSessions();

  const handlePrivacyChange = async (key: string, value: boolean | string) => {
    try {
      await updatePrivacy.mutateAsync({ [key]: value });
      toast.success("Configuração atualizada");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleSecurityChange = async (key: string, value: boolean | number) => {
    try {
      await updateSecurity.mutateAsync({ [key]: value });
      toast.success("Configuração atualizada");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession.mutateAsync(sessionId);
      toast.success("Sessão encerrada");
    } catch {
      toast.error("Erro ao encerrar sessão");
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      await terminateAllSessions.mutateAsync(true);
      setIsTerminateAllOpen(false);
      toast.success("Todas as outras sessões foram encerradas");
    } catch {
      toast.error("Erro ao encerrar sessões");
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatTimeAgo = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const tabs = [
    { id: "privacy" as const, label: "Privacidade", icon: Eye },
    { id: "security" as const, label: "Segurança", icon: Shield },
    { id: "sessions" as const, label: "Sessões", icon: Monitor },
    { id: "blocked" as const, label: "Bloqueados", icon: UserX },
  ];

  const deviceIcons: Record<string, typeof MobileIcon> = {
    mobile: MobileIcon,
    desktop: Monitor,
    tablet: MobileIcon,
    unknown: Monitor,
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/profile")} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-xl">Privacidade e Segurança</h1>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "privacy" && (
        <motion.div {...fadeUp} className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Visibilidade do Perfil</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Visibilidade do perfil</p>
                  <p className="text-xs text-muted-foreground">Quem pode ver seu perfil</p>
                </div>
                <Select
                  value={privacySettings?.profile_visibility || "public"}
                  onValueChange={(v) => handlePrivacyChange("profile_visibility", v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="followers">Seguidores</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Aparecer em buscas</p>
                  <p className="text-xs text-muted-foreground">Permitir que te encontrem</p>
                </div>
                <Switch
                  checked={privacySettings?.show_in_search_results ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_in_search_results", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Status online</p>
                  <p className="text-xs text-muted-foreground">Mostrar quando está online</p>
                </div>
                <Switch
                  checked={privacySettings?.show_online_status ?? false}
                  onCheckedChange={(v) => handlePrivacyChange("show_online_status", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Última atividade</p>
                  <p className="text-xs text-muted-foreground">Mostrar última vez ativo</p>
                </div>
                <Switch
                  checked={privacySettings?.show_last_active ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_last_active", v)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Estatísticas</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Estatísticas de apostas</p>
                  <p className="text-xs text-muted-foreground">Total de apostas e vitórias</p>
                </div>
                <Switch
                  checked={privacySettings?.show_bet_statistics ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_bet_statistics", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Taxa de acerto</p>
                  <p className="text-xs text-muted-foreground">Percentual de acertos</p>
                </div>
                <Switch
                  checked={privacySettings?.show_win_rate ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_win_rate", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Lucro/Prejuízo</p>
                  <p className="text-xs text-muted-foreground">Ganhos e perdas</p>
                </div>
                <Switch
                  checked={privacySettings?.show_profit_loss ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_profit_loss", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Ranking</p>
                  <p className="text-xs text-muted-foreground">Aparecer no ranking</p>
                </div>
                <Switch
                  checked={privacySettings?.show_ranking ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_ranking", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Histórico de palpites</p>
                  <p className="text-xs text-muted-foreground">Suas apostas anteriores</p>
                </div>
                <Switch
                  checked={privacySettings?.show_bet_history ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_bet_history", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Predições no feed</p>
                  <p className="text-xs text-muted-foreground">Suas dicas e palpites</p>
                </div>
                <Switch
                  checked={privacySettings?.show_predictions_feed ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_predictions_feed", v)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Comunicação</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">DM de seguidores</p>
                  <p className="text-xs text-muted-foreground">Receber mensagens de quem segue</p>
                </div>
                <Switch
                  checked={privacySettings?.allow_dm_from_followers ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("allow_dm_from_followers", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">DM de qualquer um</p>
                  <p className="text-xs text-muted-foreground">Permitir mensagens de não seguidores</p>
                </div>
                <Switch
                  checked={privacySettings?.allow_dm_from_anyone ?? false}
                  onCheckedChange={(v) => handlePrivacyChange("allow_dm_from_anyone", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Seguidores seguidos</p>
                  <p className="text-xs text-muted-foreground">Mostrar influenciadores que segue</p>
                </div>
                <Switch
                  checked={privacySettings?.show_followed_influencers ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_followed_influencers", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Comentários</p>
                  <p className="text-xs text-muted-foreground">Permitir comentários</p>
                </div>
                <Switch
                  checked={privacySettings?.show_comments ?? true}
                  onCheckedChange={(v) => handlePrivacyChange("show_comments", v)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Seus Dados</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">Exportar dados</p>
                <p className="text-xs text-muted-foreground">Baixar uma cópia dos seus dados</p>
              </div>
              <Button variant="outline" size="sm">
                Exportar
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === "security" && (
        <motion.div {...fadeUp} className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="font-semibold">Autenticação em Duas Etapas</h2>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  securitySettings?.two_factor_enabled
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">2FA {securitySettings?.two_factor_enabled ? "Ativado" : "Desativado"}</p>
                  <p className="text-xs text-muted-foreground">
                    {securitySettings?.two_factor_enabled
                      ? `Método: ${securitySettings.two_factor_method?.toUpperCase() || "App"}`
                      : "Proteja sua conta com verificação extra"
                    }
                  </p>
                </div>
              </div>
              <Button
                variant={securitySettings?.two_factor_enabled ? "outline" : "default"}
                size="sm"
                className={!securitySettings?.two_factor_enabled ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              >
                {securitySettings?.two_factor_enabled ? "Gerenciar" : "Ativar"}
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold">Código PIN</h2>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  securitySettings?.pin_enabled
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">PIN de Segurança</p>
                  <p className="text-xs text-muted-foreground">
                    {securitySettings?.pin_enabled ? "Ativado" : "Código para saque e transferência"}
                  </p>
                </div>
              </div>
              <Switch
                checked={securitySettings?.pin_enabled ?? false}
                onCheckedChange={(v) => handleSecurityChange("pin_enabled", v)}
              />
            </div>

            {securitySettings?.pin_enabled && (
              <div className="space-y-3 pl-13">
                <div className="flex items-center justify-between">
                  <p className="text-sm">PIN para saque</p>
                  <Switch
                    checked={securitySettings?.pin_required_for_withdrawal ?? true}
                    onCheckedChange={(v) => handleSecurityChange("pin_required_for_withdrawal", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">PIN para transferência</p>
                  <Switch
                    checked={securitySettings?.pin_required_for_transfer ?? true}
                    onCheckedChange={(v) => handleSecurityChange("pin_required_for_transfer", v)}
                  />
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold">Alertas de Segurança</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">Novo login</p>
                <Switch
                  checked={securitySettings?.alert_on_new_login ?? true}
                  onCheckedChange={(v) => handleSecurityChange("alert_on_new_login", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Mudança de senha</p>
                <Switch
                  checked={securitySettings?.alert_on_password_change ?? true}
                  onCheckedChange={(v) => handleSecurityChange("alert_on_password_change", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Alteração de 2FA</p>
                <Switch
                  checked={securitySettings?.alert_on_2fa_change ?? true}
                  onCheckedChange={(v) => handleSecurityChange("alert_on_2fa_change", v)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Histórico de Login</h2>
            </div>
            
            <div className="space-y-2">
              {loginHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    entry.success ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {entry.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{entry.event_type.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.device_name || entry.device_type || "Dispositivo"} • {entry.location || entry.ip_address || ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(entry.created_at)}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full text-xs">
              Ver histórico completo
            </Button>
          </Card>

          <Card className="p-4 space-y-4">
            <h2 className="font-semibold">Alterar Senha</h2>
            <Button variant="outline" className="w-full">
              Alterar senha
            </Button>
          </Card>
        </motion.div>
      )}

      {activeTab === "sessions" && (
        <motion.div {...fadeUp} className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Sessões Ativas</h2>
                <p className="text-xs text-muted-foreground">{sessions.length} dispositivos conectados</p>
              </div>
              {sessions.length > 1 && (
                <Button variant="outline" size="sm" onClick={() => setIsTerminateAllOpen(true)}>
                  Encerrar outras
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {sessions.map((session) => {
                const DeviceIcon = deviceIcons[session.device_type] || Monitor;
                return (
                  <div key={session.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                    session.is_current_session ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      session.is_current_session ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      <DeviceIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{session.device_name || session.device_type}</p>
                        {session.is_current_session && (
                          <Badge variant="secondary" className="text-[10px]">Atual</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.location || session.ip_address}
                        {!session.is_current_session && ` • ${formatTimeAgo(session.last_active_at)}`}
                      </p>
                    </div>
                    {!session.is_current_session && (
                      <button
                        onClick={() => handleTerminateSession(session.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <h2 className="font-semibold">Configurações de Sessão</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Múltiplas sessões</p>
                <p className="text-xs text-muted-foreground">Permitir login em vários dispositivos</p>
              </div>
              <Switch
                checked={securitySettings?.allow_multiple_sessions ?? true}
                onCheckedChange={(v) => handleSecurityChange("allow_multiple_sessions", v)}
              />
            </div>

            {securitySettings?.allow_multiple_sessions && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Máximo de sessões</p>
                  <p className="text-xs text-muted-foreground">Limite de dispositivos simultâneos</p>
                </div>
                <Select
                  value={String(securitySettings?.max_sessions || 5)}
                  onValueChange={(v) => handleSecurityChange("max_sessions", parseInt(v))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tempo limite</p>
                <p className="text-xs text-muted-foreground">Desconectar após inatividade</p>
              </div>
              <Select
                value={String(securitySettings?.session_timeout_minutes || 60)}
                onValueChange={(v) => handleSecurityChange("session_timeout_minutes", parseInt(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="480">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === "blocked" && (
        <motion.div {...fadeUp} className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Usuários Bloqueados</h2>
                <p className="text-xs text-muted-foreground">Gerencie quem está bloqueado</p>
              </div>
            </div>

            <div className="text-center py-8 text-muted-foreground">
              <UserX className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum usuário bloqueado</p>
              <p className="text-xs mt-1">Bloqueie usuários para limitar interações</p>
            </div>

            <Button variant="outline" className="w-full mt-4">
              Bloquear usuário
            </Button>
          </Card>

          <Card className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">O que acontece quando você bloqueia?</h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <p>O usuário não pode ver seu perfil</p>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <p>O usuário não pode te enviar mensagens</p>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <p>O usuário não pode te seguir ou comentar</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                <p>Você não recebe notificações do usuário</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Dialog open={isTerminateAllOpen} onOpenChange={setIsTerminateAllOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Encerrar outras sessões
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Todas as sessões em outros dispositivos serão encerradas. Você permanecerá logado neste dispositivo.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsTerminateAllOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleTerminateAllSessions}>
              Encerrar todas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
