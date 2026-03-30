import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * useAdminGuard
 * Redirects users without admin role to the home page.
 * When Supabase is not configured (dev mode), the guard is skipped.
 */
export function useAdminGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    // In mock/dev mode skip the guard entirely
    if (!isSupabaseConfigured) return;

    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      const role = user.app_metadata?.role as string | undefined;
      if (role !== "admin") {
        navigate("/");
      }
    };

    checkAdmin();

    // Re-check on auth state changes (e.g. sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/");
        return;
      }
      const role = session.user.app_metadata?.role as string | undefined;
      if (role !== "admin") navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);
}
