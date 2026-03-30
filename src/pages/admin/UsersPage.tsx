import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, MoreHorizontal, UserCheck, UserX, Ban,
  Mail, Eye, ChevronDown, Users, UserPlus, ArrowUpRight,
  Shield, Star, Loader2, Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/admin/useUsers";
import { toast } from "sonner";
import { updateUserStatus, deleteUser, FN_LIST_USERS } from "@/lib/db/functions";
import { useQueryClient } from "@tanstack/react-query";
import { AddUserModal } from "./AddUserModal";
import { UserHistoryModal } from "./UserHistoryModal";
import { UserModerationModal } from "./UserModerationModal";

const statusColor: Record<string, string> = {
  active:    "bg-emerald-400/15 text-emerald-400 border-emerald-400/20",
  suspended: "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",
  banned:    "bg-red-400/15 text-red-400 border-red-400/20",
  pending:   "bg-blue-400/15 text-blue-400 border-blue-400/20",
};
const statusLabel: Record<string, string> = {
  active:"Ativo", suspended:"Suspenso", banned:"Banido", pending:"Pendente",
};

const joined = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

export default function UsersPage() {
  const [search,       setSearch]       = useState("");
  const [filterRole,   setFilterRole]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [historyEmail, setHistoryEmail] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [moderationName, setModerationName] = useState<string | null>(null);
  const [isModerationOpen, setIsModerationOpen] = useState(false);

  const qc = useQueryClient();

  const { data: users = [], isLoading } = useUsers({ search, role: filterRole, status: filterStatus });

  const handleStatusChange = async (id: string, status: "suspended" | "banned") => {
    try {
      await updateUserStatus(id, status);
      qc.invalidateQueries({ queryKey: [FN_LIST_USERS] });
      toast.success(status === "banned" ? "Usuário banido" : "Usuário suspenso");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este usuário?")) return;
    try {
      await deleteUser(id);
      qc.invalidateQueries({ queryKey: [FN_LIST_USERS] });
      toast.success("Usuário excluído com sucesso");
    } catch {
      toast.error("Erro ao excluir usuário");
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",          value: isLoading ? "..." : users.length.toLocaleString("pt-BR"), icon: Users,    color: "text-blue-400" },
          { label: "Novos (7d)",     value: "+342",                                                    icon: UserPlus, color: "text-emerald-400" },
          { label: "Influenciadores",value: isLoading ? "..." : users.filter(u=>u.role==="influencer").length.toString(), icon: Star, color: "text-yellow-400" },
          { label: "Banidos",        value: isLoading ? "..." : users.filter(u=>u.status==="banned").length.toString(), icon: Ban, color: "text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#0d0f1a] border-white/5 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-lg">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
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
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs transition-colors">
                <Filter size={12} />{filterRole === "all" ? "Tipo" : filterRole === "fan" ? "Fã" : "Influenciador"}<ChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#141828] border-white/10">
              {[["all","Todos"],["fan","Fãs"],["influencer","Influenciadores"]].map(([v,l])=>(
                <DropdownMenuItem key={v} onClick={()=>setFilterRole(v)} className="text-white/70 hover:text-white text-sm">{l}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs transition-colors">
                <Shield size={12} />{filterStatus === "all" ? "Status" : statusLabel[filterStatus]}<ChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#141828] border-white/10">
              <DropdownMenuItem onClick={()=>setFilterStatus("all")} className="text-white/70 hover:text-white text-sm">Todos</DropdownMenuItem>
              {Object.entries(statusLabel).map(([k,v])=>(
                <DropdownMenuItem key={k} onClick={()=>setFilterStatus(k)} className="text-white/70 hover:text-white text-sm">{v}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsAddUserOpen(true)} className="h-9 bg-yellow-400 text-black hover:bg-yellow-500 text-xs px-3 gap-2 ml-2">
            <UserPlus size={14} /> Adicionar
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-[#0d0f1a] border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-white/40">
            <Loader2 size={18} className="animate-spin" /><span className="text-sm">Carregando usuários...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Usuário","Tipo","Status","Saldo","Apostas","Desde","Ações"].map((h,i)=>(
                    <th key={h} className={`text-left p-4 text-white/40 text-xs font-medium ${i>=3&&i<=5?"hidden lg:table-cell":i===3?"hidden lg:table-cell":""} ${i===7?"text-right":""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-violet flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {user.avatar_initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-medium text-sm">{user.name}</span>
                            {user.verified && <UserCheck size={12} className="text-blue-400" />}
                          </div>
                          <span className="text-white/40 text-xs">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <Badge className={`text-[10px] border ${user.role==="influencer" ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" : "bg-white/5 text-white/60 border-white/10"}`}>
                        {user.role==="influencer" ? "⭐ Influenciador" : "Fã"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-[10px] border ${statusColor[user.status]}`}>{statusLabel[user.status]}</Badge>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-white/70 text-sm">R$ {user.balance.toLocaleString("pt-BR")}</td>
                    <td className="p-4 hidden xl:table-cell text-white/70 text-sm">{user.bet_count}</td>
                    <td className="p-4 hidden xl:table-cell text-white/40 text-xs">{joined(user.created_at)}</td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors ml-auto">
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#141828] border-white/10 min-w-[160px]">
                          <DropdownMenuItem className="text-white/70 hover:text-white text-xs gap-2"><Eye size={12} /> Ver Perfil</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setHistoryEmail(user.email); setIsHistoryOpen(true); }} className="text-white/70 hover:text-white text-xs gap-2"><ArrowUpRight size={12} /> Histórico de Entradas</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setModerationName(user.name); setIsModerationOpen(true); }} className="text-white/70 hover:text-white text-xs gap-2"><Shield size={12} /> Moderação de Conteúdo</DropdownMenuItem>
                          <DropdownMenuItem className="text-white/70 hover:text-white text-xs gap-2"><Mail size={12} /> Enviar Mensagem</DropdownMenuItem>
                          <DropdownMenuItem className="text-white/70 hover:text-white text-xs gap-2"><ArrowUpRight size={12} /> Ver Transações</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem onClick={()=>handleStatusChange(user.id,"suspended")} className="text-yellow-400 hover:text-yellow-300 text-xs gap-2"><UserX size={12} /> Suspender</DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>handleStatusChange(user.id,"banned")} className="text-red-400 hover:text-red-300 text-xs gap-2"><Ban size={12} /> Banir Usuário</DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300 text-xs gap-2"><Trash2 size={12} /> Excluir permanentemente</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">Nenhum usuário encontrado</div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <p className="text-white/30 text-xs">{users.length} usuários exibidos</p>
          <div className="flex items-center gap-1">
            {[1,2,3,"...",12].map((p,i) => (
              <button key={i} className={`w-7 h-7 rounded-lg text-xs transition-colors ${p===1?"bg-yellow-400/20 text-yellow-400":"text-white/40 hover:bg-white/5 hover:text-white"}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Modals */}
      <AddUserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} />
      <UserHistoryModal email={historyEmail} isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <UserModerationModal name={moderationName} isOpen={isModerationOpen} onClose={() => setIsModerationOpen(false)} />
    </div>
  );
}
