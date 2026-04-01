import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, HelpCircle, MessageSquare, AlertCircle, CheckCircle2, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SupportTicket, TicketType } from "@/lib/database.types";

const db = supabase as any;

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<"form" | "history">("form");
  const [type, setType] = useState<TicketType>("assistance");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [successProtocol, setSuccessProtocol] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
      } else if (data) {
        // Fallback for types since database types might not be 100% updated in TS yet if not exported correctly, but it's fine.
        setTickets(data as any as SupportTicket[]);
      }
    } catch (err) {
      console.error("Error in fetchTickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (view === "history") {
      fetchTickets();
    }
  }, [view, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Você precisa estar logado.");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const protocol = `FB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      const { data, error } = await db
        .from("support_tickets")
        .insert({
          user_id: user.id,
          protocol,
          type,
          subject,
          message,
          status: "open",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating ticket:", error);
        toast.error(`Erro ao enviar chamado: ${error.message}`);
      } else {
        toast.success("Chamado enviado com sucesso!");
        setSuccessProtocol(protocol);
        setSubject("");
        setMessage("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro no cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center px-4 h-16 gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg text-white">Central de Ajuda</h1>
            <p className="text-xs text-white/50">Suporte e Reclamações</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex p-1 bg-white/5 rounded-xl">
          <button
            onClick={() => setView("form")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "form" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            Novo Chamado
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "history" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            Meus Chamados
          </button>
        </div>

        {view === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {successProtocol ? (
              <div className="gradient-card border border-emerald-500/30 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Chamado Aberto!</h2>
                  <p className="text-sm text-white/60 mt-1">Sua solicitação foi enviada para a nossa equipe.</p>
                </div>
                <div className="bg-black/30 w-full py-3 rounded-xl border border-white/5">
                  <p className="text-xs text-white/40 mb-1">PROTOCOLO DE ATENDIMENTO</p>
                  <p className="text-lg font-mono font-bold text-yellow-400">{successProtocol}</p>
                </div>
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => setSuccessProtocol(null)}
                >
                  Abrir Novo Chamado
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="gradient-card border border-white/5 p-5 rounded-2xl space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("assistance")}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      type === "assistance" 
                        ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400" 
                        : "border-white/5 bg-white/2 text-white/50"
                    }`}
                  >
                    <HelpCircle size={24} />
                    <span className="text-sm font-medium">Assistência</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("complaint")}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      type === "complaint" 
                        ? "border-red-400/50 bg-red-400/10 text-red-400" 
                        : "border-white/5 bg-white/2 text-white/50"
                    }`}
                  >
                    <AlertCircle size={24} />
                    <span className="text-sm font-medium">Reclamação</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white/70 font-medium">Assunto</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Problema com depósito"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-white/70 font-medium">Mensagem</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva detalhadamente sua situação..."
                    rows={5}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-base"
                >
                  {loading ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </form>
            )}
          </motion.div>
        )}

        {view === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {loadingTickets ? (
              <p className="text-center text-white/50 py-10">Carregando chamados...</p>
            ) : tickets.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Ticket className="w-12 h-12 text-white/20 mx-auto" />
                <p className="text-white/50">Você ainda não abriu nenhum chamado.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="gradient-card border border-white/5 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          ticket.type === "assistance" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {ticket.type === "assistance" ? "Assistência" : "Reclamação"}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === "open" ? "bg-yellow-500/20 text-yellow-400" :
                          ticket.status === "in_progress" ? "bg-purple-500/20 text-purple-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {ticket.status === "open" ? "Aberto" : ticket.status === "in_progress" ? "Em Análise" : "Resolvido"}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white text-sm">{ticket.subject}</h3>
                    </div>
                    <span className="text-[10px] text-white/30 font-mono">{ticket.protocol}</span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2 mt-2">{ticket.message}</p>
                  <p className="text-[10px] text-white/30 mt-3 pt-3 border-t border-white/5">
                    Criado em: {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
