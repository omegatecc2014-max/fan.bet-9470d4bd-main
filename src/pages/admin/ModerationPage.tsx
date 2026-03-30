import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, CheckCircle2, XCircle, Clock, MessageSquare,
  Image as ImageIcon, Flag, Eye, AlertTriangle, Zap, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useModerationQueue, useApproveContent, useRemoveContent } from "@/hooks/admin/useModerationQueue";
import type { ContentReport } from "@/lib/database.types";

const typeIcon: Record<string, any> = { hint: MessageSquare, chat: MessageSquare, image: ImageIcon };
const typeLabel: Record<string, string> = { hint:"Dica", chat:"Chat", image:"Imagem" };

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m atrás`;
  return `${Math.floor(mins / 60)}h atrás`;
};

export default function ModerationPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: allReports = [], isLoading } = useModerationQueue();
  const approveMutation = useApproveContent();
  const removeMutation  = useRemoveContent();

  const pending  = allReports.filter(r => r.status === "pending");
  const resolved = allReports.filter(r => r.status !== "pending");

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Conteúdo aprovado com sucesso");
      setSelectedId(null);
    } catch { toast.error("Erro ao aprovar conteúdo"); }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id);
      toast.error("Conteúdo removido");
      setSelectedId(null);
    } catch { toast.error("Erro ao remover conteúdo"); }
  };

  const ReportCard = ({ item }: { item: ContentReport }) => {
    const Icon = typeIcon[item.content_type];
    const isSelected = selectedId === item.id;
    const isPending = approveMutation.isPending || removeMutation.isPending;
    return (
      <motion.div layout initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-100 }}>
        <Card
          className={`bg-[#0d0f1a] border transition-colors cursor-pointer ${isSelected?"border-yellow-400/30 bg-yellow-400/3":"border-white/5 hover:border-white/10"}`}
          onClick={() => setSelectedId(isSelected ? null : item.id)}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl gradient-star flex items-center justify-center text-xs font-bold text-[#0d0f1a] flex-shrink-0">
                {item.author_avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">{item.author_name}</span>
                  <Badge className="bg-white/5 text-white/50 border-white/10 text-[10px]">
                    <Icon size={10} className="mr-1" />{typeLabel[item.content_type]}
                  </Badge>
                  {item.report_count > 0 && (
                    <Badge className="bg-red-400/15 text-red-400 border-red-400/20 text-[10px]">
                      <Flag size={10} className="mr-1" />{item.report_count} reports
                    </Badge>
                  )}
                  <span className="text-white/30 text-xs ml-auto">{timeAgo(item.created_at)}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{item.content_text}</p>
              </div>
            </div>
          </div>
          {isSelected && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
              className="border-t border-white/5 px-4 py-3 flex items-center gap-3 flex-wrap">
              <button
                disabled={isPending}
                onClick={(e)=>{ e.stopPropagation(); handleApprove(item.id); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25 disabled:opacity-50 transition-colors text-xs font-medium"
              >
                {approveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />} Aprovar
              </button>
              <button
                disabled={isPending}
                onClick={(e)=>{ e.stopPropagation(); handleRemove(item.id); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-400/15 text-red-400 hover:bg-red-400/25 disabled:opacity-50 transition-colors text-xs font-medium"
              >
                {removeMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />} Remover
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors text-xs font-medium">
                <Eye size={13} /> Ver contexto
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition-colors text-xs font-medium ml-auto">
                <AlertTriangle size={13} /> Avisar autor
              </button>
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Pendentes",       value: isLoading?"...": pending.length.toString(),  icon:Clock,         color:"text-yellow-400", bg:"bg-yellow-400/10" },
          { label:"Aprovados hoje",  value:"148",                                          icon:CheckCircle2,  color:"text-emerald-400",bg:"bg-emerald-400/10"},
          { label:"Removidos hoje",  value:"17",                                           icon:XCircle,       color:"text-red-400",    bg:"bg-red-400/10"   },
          { label:"IA Auto-block",   value:"31",                                           icon:Zap,           color:"text-blue-400",   bg:"bg-blue-400/10"  },
        ].map((s) => (
          <Card key={s.label} className="bg-[#0d0f1a] border-white/5 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-xl">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-white/5 border border-white/5 p-0.5">
          <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-yellow-400/20 data-[state=active]:text-yellow-400">
            Pendentes <Badge className="ml-1.5 bg-yellow-400/20 text-yellow-400 border-0 text-[10px]">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">Resolvidos</TabsTrigger>
          <TabsTrigger value="rules"    className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">Regras IA</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-2 text-white/40">
              <Loader2 size={18} className="animate-spin" /><span className="text-sm">Carregando fila...</span>
            </div>
          )}
          {!isLoading && pending.length === 0 && (
            <Card className="bg-[#0d0f1a] border-white/5 p-12 text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-white font-semibold">Fila de moderação limpa!</p>
              <p className="text-white/40 text-sm mt-1">Nenhum conteúdo pendente de revisão</p>
            </Card>
          )}
          <AnimatePresence mode="popLayout">
            {pending.map((item) => <ReportCard key={item.id} item={item} />)}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-3">
          {resolved.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
              <Card className="bg-[#0d0f1a] border-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{item.author_avatar}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{item.author_name}</span>
                      <Badge className={`text-[10px] border ${item.status==="approved" ? "bg-emerald-400/15 text-emerald-400 border-emerald-400/20" : "bg-red-400/15 text-red-400 border-red-400/20"}`}>
                        {item.status==="approved" ? "✓ Aprovado" : "✕ Removido"}
                      </Badge>
                      {item.resolved_by && <span className="text-white/30 text-xs">por {item.resolved_by}</span>}
                      <span className="text-white/30 text-xs ml-auto">{timeAgo(item.created_at)}</span>
                    </div>
                    <p className="text-white/40 text-sm">{item.content_text}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <Card className="bg-[#0d0f1a] border-white/5 p-5 space-y-4">
            <h3 className="font-display font-bold text-white">Regras de Moderação Automática</h3>
            {[
              { rule:"Bloqueio de spam e links externos",            active:true,  trigger:"Palavras-chave + URLs" },
              { rule:"Detecção de conteúdo adulto",                  active:true,  trigger:"Análise de imagem IA" },
              { rule:"Limite de reports para suspensão automática",  active:true,  trigger:"≥ 10 reports" },
              { rule:"Auto-aprovação de influenciadores verificados",active:false, trigger:"Badge verificado" },
              { rule:"Filtro de linguagem ofensiva",                 active:true,  trigger:"Lista de palavras customizada" },
            ].map((r) => (
              <div key={r.rule} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.active?"bg-emerald-400":"bg-white/20"}`} />
                <div className="flex-1"><p className="text-white text-sm font-medium">{r.rule}</p><p className="text-white/40 text-xs mt-0.5">{r.trigger}</p></div>
                <Badge className={`text-[10px] border ${r.active?"bg-emerald-400/15 text-emerald-400 border-emerald-400/20":"bg-white/5 text-white/40 border-white/10"}`}>
                  {r.active?"Ativo":"Inativo"}
                </Badge>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
