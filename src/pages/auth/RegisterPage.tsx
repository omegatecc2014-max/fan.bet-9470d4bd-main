import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        toast.success("Conta criada! Você já pode acessar.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border"
      >
        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-3xl mb-2">
            <span className="text-foreground">Fan</span>
            <span className="text-star">.</span>
            <span className="text-foreground">bet</span>
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            Crie sua conta para começar.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-display font-bold text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-star transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-display font-bold text-foreground mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-star transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 gradient-star text-primary-foreground font-display font-bold text-base px-6 py-3 rounded-xl glow-star transition-transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6 font-body">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-star hover:underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
