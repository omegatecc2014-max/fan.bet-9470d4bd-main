import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserModeration } from "@/hooks/admin/useUserModeration";
import { Loader2, CheckCircle, Trash2, ShieldAlert } from "lucide-react";
import { approveContent, removeContent } from "@/lib/db/functions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FN_GET_USER_REPORTS } from "@/lib/db/functions";

export function UserModerationModal({ name, isOpen, onClose }: { name: string | null; isOpen: boolean; onClose: () => void }) {
  const { data: reports = [], isLoading } = useUserModeration(name || "");
  const qc = useQueryClient();

  const handleAction = async (id: string, action: "approve" | "remove") => {
    try {
      if (action === "approve") {
        await approveContent(id);
        toast.success("Conteúdo aprovado");
      } else {
        await removeContent(id);
        toast.success("Conteúdo removido");
      }
      qc.invalidateQueries({ queryKey: [FN_GET_USER_REPORTS, name] });
    } catch (err) {
      toast.error("Erro ao atualizar conteúdo");
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141828] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Moderação de Conteúdo - {name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-white/50" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-10 text-white/40">Nenhum conteúdo reportado para este usuário</div>
          ) : (
            <div className="space-y-3">
              {reports.map((r, i) => (
                <div key={r.id || i} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <ShieldAlert size={14} className={r.status === 'pending' ? 'text-yellow-400' : 'text-white/40'} />
                      <span>{r.content_type}</span>
                      <span>•</span>
                      <span>{new Date(r.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        r.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                        r.status === 'removed' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                        'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                      }`}>
                        {r.status === 'approved' ? 'Aprovado' : r.status === 'removed' ? 'Removido' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm bg-black/20 p-2 rounded break-words">
                    {r.content_text}
                  </div>
                  {r.status === "pending" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button 
                        onClick={() => handleAction(r.id, "approve")}
                        className="flex-1 flex justify-center items-center gap-2 py-1.5 rounded bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 text-xs transition-colors"
                      >
                        <CheckCircle size={14} /> Aprovar
                      </button>
                      <button 
                        onClick={() => handleAction(r.id, "remove")}
                        className="flex-1 flex justify-center items-center gap-2 py-1.5 rounded bg-red-400/10 text-red-400 hover:bg-red-400/20 text-xs transition-colors"
                      >
                        <Trash2 size={14} /> Remover
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
