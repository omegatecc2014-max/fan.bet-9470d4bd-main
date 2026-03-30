import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser } from "@/lib/db/functions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FN_LIST_USERS } from "@/lib/db/functions";

export function AddUserModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("fan");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      await createUser({ name, email, role });
      toast.success("Usuário criado com sucesso!");
      qc.invalidateQueries({ queryKey: [FN_LIST_USERS] });
      onClose();
    } catch (err) {
      toast.error("Erro ao criar usuário");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141828] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Nome</label>
            <Input 
              value={name} onChange={(e) => setName(e.target.value)} 
              className="bg-white/5 border-white/10 text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">E-mail</label>
            <Input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
              className="bg-white/5 border-white/10 text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Tipo de Conta</label>
            <select 
              value={role} onChange={(e) => setRole(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 text-white rounded-md p-2 text-sm"
            >
              <option value="fan">Fã</option>
              <option value="influencer">Influenciador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-white hover:bg-white/10">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-yellow-400 text-black hover:bg-yellow-500">
              {loading ? "Salvando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
