import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search, Download, Mail, Filter, ChevronDown, Users, UserCheck,
  UserX, Star, TrendingUp, AlertCircle, Calendar, Tag, X,
  Send, Loader2, CheckCircle, BarChart2, Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUsers } from "@/hooks/admin/useUsers";
import { supabase } from "@/lib/supabase";

// Segment configuration
const segmentConfig: Record<string, { label: string; color: string; icon: typeof Users; description: string }> = {
  new_user:    { label: "Novo Usuário",   color: "bg-blue-400/15 text-blue-400 border-blue-400/20",       icon: Users,      description: "Cadastrou há menos de 7 dias" },
  active_fan:  { label: "Fã Ativo",       color: "bg-emerald-400/15 text-emerald-400 border-emerald-400/20", icon: UserCheck, description: "Mais de 5 apostas realizadas" },
  high_value:  { label: "Alto Valor",     color: "bg-purple-400/15 text-purple-400 border-purple-400/20",  icon: TrendingUp, description: "Mais de 50 apostas realizadas" },
  influencer:  { label: "Influenciador",  color: "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",  icon: Star,       description: "Criador de conteúdo verificado" },
  inactive:    { label: "Inativo",        color: "bg-gray-400/15 text-gray-400 border-gray-400/20",        icon: UserX,      description: "Sem atividade há 30+ dias" },
  buyer:       { label: "Comprador",      color: "bg-orange-400/15 text-orange-400 border-orange-400/20",  icon: BarChart2,  description: "Realizou compras na loja" },
  vip:         { label: "VIP",            color: "bg-pink-400/15 text-pink-400 border-pink-400/20",        icon: Star,       description: "Mais de R$500 em compras" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

// Mock enriched lead data since backend view may not be ready yet
const mockEnrichLeads = (users: any[]) =>
  users.map((u, i) => ({
    ...u,
    segment: Object.keys(segmentConfig)[i % Object.keys(segmentConfig).length],
    marketing_opt_in: i % 5 !== 0, // 80% opted in
    last_active_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_bets: Math.floor(Math.random() * 120),
    total_spent: parseFloat((Math.random() * 600).toFixed(2)),
  }));

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [filterSegment, setFilterSegment] = useState("all");
  const [filterOptIn, setFilterOptIn] = useState("all");
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const { data: rawUsers = [], isLoading } = useUsers({ search: "", role: "all", status: "all" });
  const leads = useMemo(() => mockEnrichLeads(rawUsers), [rawUsers]);

  const filteredLeads = useMemo(() => {
    let result = [...leads];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q)
      );
    }
    if (filterSegment !== "all") result = result.filter(l => l.segment === filterSegment);
    if (filterOptIn === "opted_in") result = result.filter(l => l.marketing_opt_in);
    if (filterOptIn === "opted_out") result = result.filter(l => !l.marketing_opt_in);
    return result;
  }, [leads, search, filterSegment, filterOptIn]);

  const optedInCount = filteredLeads.filter(l => l.marketing_opt_in).length;
  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => { counts[l.segment] = (counts[l.segment] || 0) + 1; });
    return counts;
  }, [leads]);

  // CSV Export
  const handleExportCSV = () => {
    const toExport = filteredLeads.filter(l =>
      selectedLeads.size === 0 || selectedLeads.has(l.id)
    );
    const headers = ["Nome", "Email", "Segmento", "Opt-in", "Apostas", "Gasto Total (R$)", "Último Acesso", "Cadastro"];
    const rows = toExport.map(l => [
      `"${l.name || ""}"`,
      `"${l.email || ""}"`,
      `"${segmentConfig[l.segment]?.label || l.segment}"`,
      l.marketing_opt_in ? "Sim" : "Não",
      l.total_bets,
      l.total_spent?.toFixed(2) || "0.00",
      `"${l.last_active_at ? formatDate(l.last_active_at) : ""}"`,
      `"${l.created_at ? formatDate(l.created_at) : ""}"`,
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_fanbet_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${toExport.length} leads exportados com sucesso!`);
  };

  // Real Resend Email Campaign via Supabase Edge Function
  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Preencha o assunto e o corpo do e-mail");
      return;
    }
    setIsSending(true);
    try {
      // Get opted-in leads based on current filter
      const targetLeads = filteredLeads
        .filter(l => l.marketing_opt_in)
        .map(l => ({ id: l.id, name: l.name || "", email: l.email, segment: l.segment }));

      if (targetLeads.length === 0) {
        toast.error("Nenhum lead com opt-in para o filtro selecionado");
        setIsSending(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-campaign-email", {
        body: {
          subject: emailSubject,
          body: emailBody,
          leads: targetLeads,
          campaign_name: emailSubject.slice(0, 40),
        },
      });

      if (error) throw error;

      setIsEmailOpen(false);
      setEmailSubject("");
      setEmailBody("");

      toast.success(
        `📧 Campanha enviada! ${data.sent} entregues${data.failed > 0 ? `, ${data.failed} falharam` : ""}`,
        { description: `Total: ${data.total} destinatários · Segmento: ${filterSegment === "all" ? "Todos" : segmentConfig[filterSegment]?.label}` }
      );
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("RESEND_API_KEY")) {
        toast.error("Configure a chave RESEND_API_KEY no Supabase", {
          description: "Acesse: Dashboard → Edge Functions → Secrets",
        });
      } else {
        toast.error("Erro ao enviar campanha: " + msg);
      }
    } finally {
      setIsSending(false);
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Leads",   value: leads.length.toLocaleString("pt-BR"),      icon: Users,     color: "text-blue-400" },
          { label: "Opt-in Ativo",     value: leads.filter(l=>l.marketing_opt_in).length, icon: CheckCircle,color: "text-emerald-400" },
          { label: "Novos (7 dias)",   value: leads.filter(l=> new Date(l.created_at) > new Date(Date.now()-7*86400000)).length, icon: TrendingUp, color: "text-yellow-400" },
          { label: "Inativos",         value: leads.filter(l=>l.segment==="inactive").length, icon: AlertCircle, color: "text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#0d0f1a] border-white/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-xl">{typeof s.value === "number" ? s.value.toLocaleString("pt-BR") : s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Segment Overview */}
      <Card className="bg-[#0d0f1a] border-white/5 p-4">
        <p className="text-white/40 text-xs font-medium mb-3">Distribuição por Segmento</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(segmentConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterSegment(filterSegment === key ? "all" : key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                filterSegment === key ? cfg.color + " ring-1 ring-white/20" : "bg-white/3 border-white/5 text-white/50 hover:text-white"
              }`}
            >
              <cfg.icon size={11} />
              {cfg.label}
              <span className="bg-white/10 rounded-full px-1.5 py-0.5 text-[10px]">
                {segmentCounts[key] || 0}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Filters & Actions */}
      <Card className="bg-[#0d0f1a] border-white/5 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs transition-colors">
                <Filter size={12} />
                {filterOptIn === "all" ? "Opt-in" : filterOptIn === "opted_in" ? "Opt-in ✅" : "Opt-out ❌"}
                <ChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#141828] border-white/10">
              {[["all","Todos"],["opted_in","Com Opt-in"],["opted_out","Sem Opt-in"]].map(([v,l])=>(
                <DropdownMenuItem key={v} onClick={()=>setFilterOptIn(v)} className="text-white/70 hover:text-white text-xs">{l}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedLeads.size > 0 && (
            <span className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-yellow-400/10 text-yellow-400 text-xs font-medium border border-yellow-400/20">
              {selectedLeads.size} selecionados
              <button onClick={() => setSelectedLeads(new Set())} className="ml-1 hover:opacity-70">
                <X size={11} />
              </button>
            </span>
          )}

          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="h-9 border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 text-xs gap-2"
          >
            <Download size={14} />
            Exportar CSV
          </Button>

          <Button
            onClick={() => setIsEmailOpen(true)}
            className="h-9 bg-yellow-400 text-black hover:bg-yellow-500 text-xs gap-2"
          >
            <Mail size={14} />
            Campanha de E-mail
          </Button>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="bg-[#0d0f1a] border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-white/40">
            <Loader2 size={18} className="animate-spin" /><span className="text-sm">Carregando leads...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-4 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 cursor-pointer"
                    />
                  </th>
                  {["Lead","Segmento","Opt-in","Apostas","Gasto","Último Acesso","Cadastro",""].map((h, i) => (
                    <th key={i} className={`text-left p-4 text-white/40 text-xs font-medium ${i > 2 && i < 6 ? "hidden lg:table-cell" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, i) => {
                  const seg = segmentConfig[lead.segment] || segmentConfig.new_user;
                  const SegIcon = seg.icon;
                  return (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/3 hover:bg-white/2 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => toggleSelectLead(lead.id)}
                          className="w-4 h-4 rounded bg-white/10 border-white/20 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl gradient-violet flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {lead.avatar_initials || lead.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{lead.name || "—"}</p>
                            <p className="text-white/40 text-xs">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`text-[10px] border ${seg.color} flex items-center gap-1 w-fit`}>
                          <SegIcon size={10} />
                          {seg.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          lead.marketing_opt_in
                            ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                            : "bg-red-400/10 text-red-400 border-red-400/20"
                        }`}>
                          {lead.marketing_opt_in ? "✓ Opt-in" : "✗ Opt-out"}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-white/70 text-sm">{lead.total_bets}</td>
                      <td className="p-4 hidden lg:table-cell text-white/70 text-sm">
                        {lead.total_spent > 0 ? `R$ ${lead.total_spent.toFixed(2)}` : "—"}
                      </td>
                      <td className="p-4 hidden xl:table-cell text-white/40 text-xs">
                        {lead.last_active_at ? formatDate(lead.last_active_at) : "—"}
                      </td>
                      <td className="p-4 hidden xl:table-cell text-white/40 text-xs">
                        {lead.created_at ? formatDate(lead.created_at) : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => { setSelectedLead(lead); setIsDetailOpen(true); }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors ml-auto"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filteredLeads.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">Nenhum lead encontrado</div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <p className="text-white/30 text-xs">
            {filteredLeads.length} leads · {optedInCount} com opt-in
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 10].map((p, i) => (
              <button key={i} className={`w-7 h-7 rounded-lg text-xs transition-colors ${p === 1 ? "bg-yellow-400/20 text-yellow-400" : "text-white/40 hover:bg-white/5 hover:text-white"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Email Campaign Modal */}
      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mail size={18} className="text-yellow-400" />
              Campanha de E-mail
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Audience Summary */}
            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                <Users size={18} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{optedInCount} destinatários</p>
                <p className="text-white/40 text-xs">
                  {filterSegment === "all" ? "Todos os leads com opt-in" : `Segmento: ${segmentConfig[filterSegment]?.label}`}
                </p>
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Assunto do E-mail</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Ex: 🎉 Promoção exclusiva Fan.bet — só hoje!"
                className="bg-white/5 border-white/10 text-white text-sm h-10"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Mensagem (texto ou HTML básico)</label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Olá {nome}! Temos uma oferta especial para você..."
                className="bg-white/5 border-white/10 text-white text-sm min-h-[140px]"
              />
              <p className="text-white/30 text-[10px] mt-1">
                Use {"{nome}"} para personalizar com o nome do lead.
              </p>
            </div>

            <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-3 flex gap-2">
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-300 text-xs">
                E-mails enviados via <strong>Resend</strong> com template HTML personalizado da Fan.bet.
                Configure <code className="bg-white/10 px-1 rounded">RESEND_API_KEY</code> e <code className="bg-white/10 px-1 rounded">RESEND_FROM_EMAIL</code> nas Secrets da Edge Function no Supabase.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEmailOpen(false)}
              className="text-white/60 h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="h-9 border-white/10 bg-white/5 text-white/70 hover:text-white text-xs gap-2"
            >
              <Download size={13} />
              Exportar Lista
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSending}
              className="bg-yellow-400 text-black hover:bg-yellow-500 h-9 text-xs gap-2"
            >
              {isSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {isSending ? "Enviando..." : "Enviar Campanha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#0d0f1a] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserCheck size={18} className="text-yellow-400" />
              Detalhes do Lead
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (() => {
            const seg = segmentConfig[selectedLead.segment] || segmentConfig.new_user;
            const SegIcon = seg.icon;
            return (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl gradient-violet flex items-center justify-center text-xl font-bold text-white">
                    {selectedLead.avatar_initials || selectedLead.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selectedLead.name || "—"}</p>
                    <p className="text-white/50 text-sm">{selectedLead.email}</p>
                    <Badge className={`text-[10px] border mt-1 ${seg.color} flex items-center gap-1 w-fit`}>
                      <SegIcon size={10} /> {seg.label}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Apostas", value: selectedLead.total_bets, color: "text-blue-400" },
                    { label: "Gasto Total", value: `R$ ${(selectedLead.total_spent || 0).toFixed(2)}`, color: "text-emerald-400" },
                    { label: "Opt-in Marketing", value: selectedLead.marketing_opt_in ? "✓ Ativo" : "✗ Inativo", color: selectedLead.marketing_opt_in ? "text-emerald-400" : "text-red-400" },
                    { label: "Membro desde", value: selectedLead.created_at ? formatDate(selectedLead.created_at) : "—", color: "text-white/70" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3">
                      <p className="text-white/40 text-xs mb-1">{label}</p>
                      <p className={`font-bold text-sm ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-1">Descrição do Segmento</p>
                  <p className="text-white/70 text-sm">{seg.description}</p>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button
              onClick={() => {
                setIsDetailOpen(false);
                setEmailSubject(`Olá ${selectedLead?.name?.split(" ")[0]}, temos algo especial para você!`);
                setIsEmailOpen(true);
              }}
              className="bg-yellow-400 text-black hover:bg-yellow-500 h-9 text-xs gap-2"
            >
              <Mail size={13} /> Enviar E-mail a este Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
