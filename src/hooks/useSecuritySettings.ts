import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { UserSecuritySettings, UserSession, LoginHistory } from "@/lib/database.types";

const DEFAULT_SECURITY_SETTINGS: UserSecuritySettings = {
  id: "default",
  user_id: "default",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  two_factor_enabled: false,
  two_factor_method: null,
  two_factor_phone: null,
  pin_enabled: false,
  pin_required_for_withdrawal: true,
  pin_required_for_transfer: true,
  alert_on_new_login: true,
  alert_on_password_change: true,
  alert_on_2fa_change: true,
  alert_email: null,
  allow_multiple_sessions: true,
  max_sessions: 5,
  session_timeout_minutes: 60,
  password_changed_at: null,
  require_password_for_withdrawal: true,
};

const MOCK_SESSIONS: UserSession[] = [
  {
    id: "s1",
    user_id: "u1",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    last_active_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    device_type: "mobile",
    device_name: "iPhone 15 Pro",
    browser: "Safari",
    operating_system: "iOS 17",
    ip_address: "189.45.123.78",
    location: "São Paulo, BR",
    is_current_session: true,
    is_active: true,
  },
  {
    id: "s2",
    user_id: "u1",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    last_active_at: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    device_type: "desktop",
    device_name: "Chrome Windows",
    browser: "Chrome 120",
    operating_system: "Windows 11",
    ip_address: "179.95.67.23",
    location: "Rio de Janeiro, BR",
    is_current_session: false,
    is_active: true,
  },
];

const MOCK_LOGIN_HISTORY: LoginHistory[] = [
  { id: "lh1", user_id: "u1", created_at: new Date().toISOString(), event_type: "login", device_type: "mobile", device_name: "iPhone 15 Pro", ip_address: "189.45.123.78", location: "São Paulo, BR", user_agent: "Mozilla/5.0", success: true, metadata: null },
  { id: "lh2", user_id: "u1", created_at: new Date(Date.now() - 3600000).toISOString(), event_type: "logout", device_type: "mobile", device_name: "iPhone 15 Pro", ip_address: "189.45.123.78", location: "São Paulo, BR", user_agent: "Mozilla/5.0", success: true, metadata: null },
  { id: "lh3", user_id: "u1", created_at: new Date(Date.now() - 86400000).toISOString(), event_type: "login", device_type: "desktop", device_name: "Chrome Windows", ip_address: "179.95.67.23", location: "Rio de Janeiro, BR", user_agent: "Mozilla/5.0", success: true, metadata: null },
  { id: "lh4", user_id: "u1", created_at: new Date(Date.now() - 172800000).toISOString(), event_type: "login", device_type: "mobile", device_name: "Samsung Galaxy S24", ip_address: "200.150.45.90", location: "Belo Horizonte, BR", user_agent: "Mozilla/5.0", success: true, metadata: null },
  { id: "lh5", user_id: "u1", created_at: new Date(Date.now() - 259200000).toISOString(), event_type: "password_change", device_type: "desktop", device_name: "Chrome Windows", ip_address: "179.95.67.23", location: "Rio de Janeiro, BR", user_agent: "Mozilla/5.0", success: true, metadata: null },
];

export function useSecuritySettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["security_settings", user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !user) {
        return DEFAULT_SECURITY_SETTINGS;
      }
      const { data, error } = await (supabase as any)
        .rpc("fn_get_security_settings", { p_user_id: user.id });

      if (error || !data || data.length === 0) {
        return DEFAULT_SECURITY_SETTINGS;
      }

      return data[0] as UserSecuritySettings;
    },
    enabled: !!user,
  });
}

export function useUpdateSecuritySettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<UserSecuritySettings>) => {
      if (!isSupabaseConfigured || !user) {
        return;
      }
      const { error } = await (supabase as any).rpc("fn_update_security_settings", {
        p_user_id: user.id,
        ...settings,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["security_settings"] });
    },
  });
}

export function useUserSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_sessions", user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !user) {
        return MOCK_SESSIONS;
      }
      const { data, error } = await (supabase as any)
        .rpc("fn_get_user_sessions", { p_user_id: user.id });

      if (error || !data) {
        return MOCK_SESSIONS;
      }

      return data as UserSession[];
    },
    enabled: !!user,
  });
}

export function useTerminateSession() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!isSupabaseConfigured || !user) {
        return;
      }
      const { error } = await (supabase as any).rpc("fn_terminate_session", {
        p_session_id: sessionId,
        p_user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_sessions"] });
    },
  });
}

export function useTerminateAllSessions() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (keepCurrent: boolean = true) => {
      if (!isSupabaseConfigured || !user) {
        return;
      }
      const { error } = await (supabase as any).rpc("fn_terminate_all_sessions", {
        p_user_id: user.id,
        p_keep_current: keepCurrent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_sessions"] });
    },
  });
}

export function useLoginHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["login_history", user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !user) {
        return MOCK_LOGIN_HISTORY;
      }
      const { data, error } = await (supabase as any)
        .rpc("fn_get_login_history", { p_user_id: user.id, p_limit: 20 });

      if (error || !data) {
        return MOCK_LOGIN_HISTORY;
      }

      return data as LoginHistory[];
    },
    enabled: !!user,
  });
}
