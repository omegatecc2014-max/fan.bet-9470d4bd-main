import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listNotifications,
  createNotification,
  sendNotification,
  cancelNotification,
  deleteNotification,
  getNotificationDelivery,
  getNotificationStats,
  FN_LIST_NOTIFICATIONS,
  type NotificationFilters
} from "@/lib/db/functions";

export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: [FN_LIST_NOTIFICATIONS, filters],
    queryFn: () => listNotifications(filters),
    staleTime: 30_000,
  });
}

export function useNotificationDelivery(notificationId: string | null) {
  return useQuery({
    queryKey: ["notification_delivery", notificationId],
    queryFn: () => notificationId ? getNotificationDelivery(notificationId) : Promise.resolve([]),
    enabled: !!notificationId,
    staleTime: 30_000,
  });
}

export function useNotificationStats(notificationId: string | null) {
  return useQuery({
    queryKey: ["notification_stats", notificationId],
    queryFn: () => notificationId ? getNotificationStats(notificationId) : Promise.resolve(null),
    enabled: !!notificationId,
    staleTime: 30_000,
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FN_LIST_NOTIFICATIONS] });
    },
  });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FN_LIST_NOTIFICATIONS] });
    },
  });
}

export function useCancelNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FN_LIST_NOTIFICATIONS] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FN_LIST_NOTIFICATIONS] });
    },
  });
}
