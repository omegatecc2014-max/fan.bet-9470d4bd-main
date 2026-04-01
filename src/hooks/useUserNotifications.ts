import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Notification, UserNotification } from "@/lib/database.types";

interface UserNotificationWithDetails extends UserNotification {
  notification: Notification;
}

const MOCK_USER_NOTIFICATIONS: UserNotificationWithDetails[] = [
  {
    id: "un1",
    notification_id: "n1",
    user_id: "u1",
    user_email: "lucas@email.com",
    user_name: "Lucas",
    delivered: true,
    delivered_at: new Date(Date.now() - 60000).toISOString(),
    read: true,
    read_at: new Date(Date.now() - 30000).toISOString(),
    created_at: new Date(Date.now() - 60000).toISOString(),
    notification: {
      id: "n1",
      created_at: new Date(Date.now() - 60000).toISOString(),
      title: "Manutenção Programada",
      message: "Sistema estará em manutenção das 02h às 04h.",
      type: "warning",
      target_type: "all",
      target_value: null,
      sent_by: "Admin",
      read_count: 2847,
      total_recipients: 5600,
      status: "sent",
    },
  },
  {
    id: "un2",
    notification_id: "n2",
    user_id: "u1",
    user_email: "lucas@email.com",
    user_name: "Lucas",
    delivered: true,
    delivered_at: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    read_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    notification: {
      id: "n2",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      title: "Novos termos de uso",
      message: "Atualizamos nossos termos de uso. Por favor, revise.",
      type: "info",
      target_type: "all",
      target_value: null,
      sent_by: "Admin",
      read_count: 1203,
      total_recipients: 5600,
      status: "sent",
    },
  },
];

export function useUserNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_notifications", user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !user) {
        return MOCK_USER_NOTIFICATIONS;
      }
      const { data, error } = await supabase
        .from("user_notifications")
        .select(`
          *,
          notification:notifications(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching notifications:", error);
        return MOCK_USER_NOTIFICATIONS;
      }

      return (data as unknown as UserNotificationWithDetails[]) || MOCK_USER_NOTIFICATIONS;
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

export function useUnreadCount() {
  const { data } = useUserNotifications();
  const unreadCount = data?.filter((n) => !n.read).length || 0;
  return unreadCount;
}

export function useMarkNotificationRead() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!isSupabaseConfigured || !user) {
        return;
      }
      const { error } = await supabase.rpc("fn_mark_notification_read", {
        p_notification_id: notificationId,
        p_user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured || !user) {
        return;
      }
      const { data: notifications } = await supabase
        .from("user_notifications")
        .select("notification_id")
        .eq("user_id", user.id)
        .eq("read", false);

      if (!notifications || notifications.length === 0) return;

      for (const notif of notifications) {
        await supabase.rpc("fn_mark_notification_read", {
          p_notification_id: notif.notification_id,
          p_user_id: user.id,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_notifications"] });
    },
  });
}
