import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      if (user) {
        const sessionId = localStorage.getItem("fanbet_session_id");
        if (sessionId) {
          // Invalidate session
          await (supabase as any).from("user_sessions").update({ is_active: false }).eq("id", sessionId);
          localStorage.removeItem("fanbet_session_id");
        }
        
        // Track logout
        const userAgent = navigator.userAgent;
        const deviceType = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent) ? 'mobile' : /tablet|ipad|playbook|silk/i.test(userAgent) ? 'tablet' : 'desktop';
        const browser = userAgent.includes("Chrome") ? "Chrome" : userAgent.includes("Safari") ? "Safari" : userAgent.includes("Firefox") ? "Firefox" : "Browser";
        
        await (supabase as any).from("login_history").insert({
          user_id: user.id,
          event_type: "logout",
          device_type: deviceType,
          device_name: `${browser} - ${deviceType}`,
          user_agent: userAgent,
          success: true
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Saiu com sucesso");
    } catch (error: any) {
      toast.error(error.message || "Erro ao sair");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
