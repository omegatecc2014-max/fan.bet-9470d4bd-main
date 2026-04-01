import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { UserPrivacySettings, ProfileVisibility } from "@/lib/database.types";

const DEFAULT_PRIVACY_SETTINGS: UserPrivacySettings = {
  id: "default",
  user_id: "default",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  profile_visibility: "public",
  show_bet_statistics: true,
  show_win_rate: true,
  show_profit_loss: true,
  show_ranking: true,
  show_bet_history: true,
  show_followed_influencers: true,
  show_last_active: true,
  show_location: false,
  allow_dm_from_followers: true,
  allow_dm_from_anyone: false,
  show_online_status: false,
  show_in_search_results: true,
  allow_data_export: true,
  show_predictions_feed: true,
  show_comments: true,
};

export function usePrivacySettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["privacy_settings", user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !user) {
        return DEFAULT_PRIVACY_SETTINGS;
      }
      const { data, error } = await (supabase as any)
        .rpc("fn_get_privacy_settings", { p_user_id: user.id });

      if (error || !data || data.length === 0) {
        return DEFAULT_PRIVACY_SETTINGS;
      }

      return data[0] as UserPrivacySettings;
    },
    enabled: !!user,
  });
}

export function useUpdatePrivacySettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<UserPrivacySettings>) => {
      if (!isSupabaseConfigured || !user) {
        return;
      }
      const { error } = await (supabase as any).rpc("fn_update_privacy_settings", {
        p_user_id: user.id,
        ...settings,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["privacy_settings"] });
    },
  });
}
