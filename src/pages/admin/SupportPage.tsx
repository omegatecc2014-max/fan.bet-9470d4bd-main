import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, CheckCircle2, Ticket, AlertCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { SupportTicket, TicketStatus } from "@/lib/database.types";

// Untyped reference to bypass supabase-js type inference issues with hand-written Database types
const db = supabase as any;

interface TicketWithUser extends SupportTicket {
  profiles?: {
    name: string;
    email: string;
  };
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<TicketWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets for admin:", error);
        toast.error("Falha ao carregar os chamados.");
      } else if (data) {
        setTickets(data as any);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro no cliente ao buscar chamados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id: string, newStatus: TicketStatus) => {
    try {
      const { error } = await db
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) {
        toast.error("Erro ao atualizar o status");
        console.error(error);
      } else {
        toast.success("Status atualizado com sucesso!");
        setTickets((prev) => 
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Ocorreu um erro na ação.");
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Central de Chamados</h2>
          <p className="text-white/50 text-sm mt-1">Gerencie reclamações e pedidos de assistência</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar protocolo, nome ou assunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors"
          />
        </div>
      </div>

      <Card className="bg-[#0d0f1a] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/40 uppercase bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Protocolo / Data</th>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Assunto / Tipo</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando chamados...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                    <div className="flex flex-col items-center">
                      <Ticket className="w-10 h-10 text-white/10 mb-3" />
                      <p>Nenhum chamado encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, i) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={ticket.id}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-yellow-400 text-xs font-bold">{ticket.protocol}</div>
                      <div className="text-[10px] text-white/40 mt-1">
                        {new Date(ticket.created_at).toLocaleString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{ticket.profiles?.name || "Usuário Desconhecido"}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{ticket.profiles?.email || "Sem e-mail"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white/90 line-clamp-1">{ticket.subject}</div>
                      <Badge className={`text-[9px] mt-1.5 border-0 ${
                        ticket.type === "assistance" ? "bg-blue-500/15 text-blue-400" : "bg-red-500/15 text-red-400"
                      }`}>
                        {ticket.type === "assistance" ? "Assistência" : "Reclamação"}
                      </Badge>
                      <p className="text-xs text-white/50 mt-2 line-clamp-2 italic border-l-2 border-white/10 pl-2">
                        "{ticket.message}"
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`border-0 gap-1.5 px-2 py-1 ${
                        ticket.status === "open" ? "bg-yellow-500/15 text-yellow-400" :
                        ticket.status === "in_progress" ? "bg-purple-500/15 text-purple-400" :
                        "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {ticket.status === "open" && <AlertCircle size={12} />}
                        {ticket.status === "in_progress" && <Clock size={12} />}
                        {ticket.status === "closed" && <CheckCircle2 size={12} />}
                        {ticket.status === "open" ? "Aberto" : ticket.status === "in_progress" ? "Em Análise" : "Resolvido"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 space-x-2 text-right">
                      {ticket.status !== "closed" && (
                        <select
                          value={ticket.status}
                          onChange={(e) => updateStatus(ticket.id, e.target.value as TicketStatus)}
                          className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none hover:bg-white/10 cursor-pointer"
                        >
                          <option value="open">Aberto</option>
                          <option value="in_progress">Em Análise</option>
                          <option value="closed">Resolvido</option>
                        </select>
                      )}
                      {ticket.status === "closed" && (
                        <span className="text-[10px] uppercase font-bold text-emerald-500/50">Finalizado</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
