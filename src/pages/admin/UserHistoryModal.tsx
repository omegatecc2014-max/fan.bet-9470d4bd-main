import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserHistory } from "@/hooks/admin/useUserHistory";
import { Loader2, Monitor, Smartphone, Tablet } from "lucide-react";

export function UserHistoryModal({ email, isOpen, onClose }: { email: string | null; isOpen: boolean; onClose: () => void }) {
  const { data: history = [], isLoading } = useUserHistory(email || "");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141828] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Entradas - {email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-white/50" /></div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-white/40">Nenhum registro encontrado</div>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 gap-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/50">
                      {h.device === 'mobile' ? <Smartphone size={16} /> : h.device === 'tablet' ? <Tablet size={16} /> : <Monitor size={16} />}
                    </div>
                    <div>
                      <p className="font-medium">{h.page}</p>
                      <p className="text-xs text-white/50">{new Date(h.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-xs text-white/40 text-right">
                    Duração: {h.session_duration_s}s
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
