// ============================================================
// Fan.bet Database Types — auto-synced with Supabase schema
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type UserRole = "fan" | "influencer" | "admin";
export type UserStatus = "active" | "suspended" | "banned" | "pending";
export type InfluencerTier = "gold" | "silver" | "bronze";
export type ContentType = "hint" | "chat" | "image";
export type ContentStatus = "pending" | "approved" | "removed";
export type DeviceType = "mobile" | "desktop" | "tablet";

// ── profiles ──────────────────────────────────────────────
export interface Profile {
  id: string;
  created_at: string;
  name: string;
  email: string;
  cpf?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  bet_count: number;
  verified: boolean;
  avatar_initials: string;
  full_name?: string;
}

// ── influencer_profiles ───────────────────────────────────
export interface InfluencerProfile {
  id: string;
  profile_id: string;
  created_at: string;
  handle: string;
  followers: number;
  subscribers: number;
  accuracy_pct: number;
  hints_count: number;
  pending_hints: number;
  revenue_total: number;
  tier: InfluencerTier | null;
  bio: string | null;
}

// ── transactions ──────────────────────────────────────────
export type TransactionType = "deposit" | "withdrawal" | "conversion";
export type PaymentMethod = "PIX" | "Cartão" | "TED";
export type TransactionStatus = "success" | "pending" | "failed" | "chargeback" | "cancelled";
export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

export interface Transaction {
  id: string;
  created_at: string;
  profile_id: string;
  profile_name: string;
  profile_avatar: string;
  profile_email?: string;
  profile_document?: string;
  type: TransactionType;
  method: PaymentMethod;
  amount: number;
  status: TransactionStatus;
  
  // PIX data
  pix_key?: string;
  pix_key_type?: PixKeyType;
  pix_recipient_name?: string;
  pix_recipient_bank?: string;
  
  // Conversion data
  converted_currency?: string;
  converted_amount?: number;
  conversion_rate?: number;
  
  // Protocol & admin
  protocol?: string;
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
}

// ── content_reports ───────────────────────────────────────
export interface ContentReport {
  id: string;
  created_at: string;
  author_name: string;
  author_avatar: string;
  content_type: ContentType;
  content_text: string;
  report_count: number;
  status: ContentStatus;
  resolved_by: string | null;
  resolved_at: string | null;
}

// ── page_events ───────────────────────────────────────────
export interface PageEvent {
  id: string;
  created_at: string;
  page: string;
  device: DeviceType;
  session_duration_s: number;
  country: string;
}

// ── notifications ────────────────────────────────────────
export type NotificationType = "info" | "warning" | "success" | "error" | "system";
export type NotificationTargetType = "all" | "role" | "specific_users" | "influencers" | "fans";
export type NotificationStatus = "draft" | "sent" | "cancelled";

export interface Notification {
  id: string;
  created_at: string;
  title: string;
  message: string;
  type: NotificationType;
  target_type: NotificationTargetType;
  target_value: string | null;
  sent_by: string;
  read_count: number;
  total_recipients: number;
  status: NotificationStatus;
}

export interface UserNotification {
  id: string;
  notification_id: string;
  user_id: string | null;
  user_email: string;
  user_name: string;
  delivered: boolean;
  delivered_at: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationStats {
  total_recipients: number;
  delivered_count: number;
  read_count: number;
  delivery_rate: number;
  read_rate: number;
}

// ── privacy settings ───────────────────────────────────────
export type ProfileVisibility = "public" | "followers" | "private";

export interface UserPrivacySettings {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  profile_visibility: ProfileVisibility;
  show_bet_statistics: boolean;
  show_win_rate: boolean;
  show_profit_loss: boolean;
  show_ranking: boolean;
  show_bet_history: boolean;
  show_followed_influencers: boolean;
  show_last_active: boolean;
  show_location: boolean;
  allow_dm_from_followers: boolean;
  allow_dm_from_anyone: boolean;
  show_online_status: boolean;
  show_in_search_results: boolean;
  allow_data_export: boolean;
  show_predictions_feed: boolean;
  show_comments: boolean;
}

// ── security settings ──────────────────────────────────────
export type TwoFactorMethod = "totp" | "sms" | "email";

export interface UserSecuritySettings {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  two_factor_enabled: boolean;
  two_factor_method: TwoFactorMethod | null;
  two_factor_phone: string | null;
  pin_enabled: boolean;
  pin_required_for_withdrawal: boolean;
  pin_required_for_transfer: boolean;
  alert_on_new_login: boolean;
  alert_on_password_change: boolean;
  alert_on_2fa_change: boolean;
  alert_email: string | null;
  allow_multiple_sessions: boolean;
  max_sessions: number;
  session_timeout_minutes: number;
  password_changed_at: string | null;
  require_password_for_withdrawal: boolean;
}

// ── sessions ───────────────────────────────────────────────
export type SessionDeviceType = "mobile" | "desktop" | "tablet" | "unknown";

export interface UserSession {
  id: string;
  user_id: string;
  created_at: string;
  last_active_at: string;
  expires_at: string;
  device_type: SessionDeviceType;
  device_name: string | null;
  browser: string | null;
  operating_system: string | null;
  ip_address: string | null;
  location: string | null;
  is_current_session: boolean;
  is_active: boolean;
}

// ── login history ─────────────────────────────────────────
export type LoginEventType = "login" | "logout" | "password_change" | "2fa_enable" | "2fa_disable" | "pin_set" | "pin_change" | "session_revoked";

export interface LoginHistory {
  id: string;
  user_id: string;
  created_at: string;
  event_type: LoginEventType;
  device_type: string | null;
  device_name: string | null;
  ip_address: string | null;
  location: string | null;
  user_agent: string | null;
  success: boolean;
  metadata: Record<string, unknown> | null;
}

// ── blocked users ─────────────────────────────────────────
export interface BlockedUser {
  id: string;
  blocked_user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
  created_at: string;
  reason: string | null;
}

// ── support tickets ─────────────────────────────────────────
export type TicketType = "assistance" | "complaint";
export type TicketStatus = "open" | "in_progress" | "closed";

export interface SupportTicket {
  id: string;
  user_id: string;
  protocol: string;
  type: TicketType;
  subject: string;
  message: string;
  status: TicketStatus;
  created_at: string;
}

// ── Supabase DB wrapper type ──────────────────────────────
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      influencer_profiles: {
        Row: InfluencerProfile;
        Insert: Omit<InfluencerProfile, "id" | "created_at">;
        Update: Partial<Omit<InfluencerProfile, "id" | "created_at">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at">;
        Update: Partial<Omit<Transaction, "id" | "created_at">>;
      };
      content_reports: {
        Row: ContentReport;
        Insert: Omit<ContentReport, "id" | "created_at">;
        Update: Partial<Omit<ContentReport, "id" | "created_at">>;
      };
      page_events: {
        Row: PageEvent;
        Insert: Omit<PageEvent, "id" | "created_at">;
        Update: Partial<Omit<PageEvent, "id" | "created_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "created_at">>;
      };
      user_notifications: {
        Row: UserNotification;
        Insert: Omit<UserNotification, "id" | "created_at">;
        Update: Partial<Omit<UserNotification, "id" | "created_at">>;
      };
      user_privacy_settings: {
        Row: UserPrivacySettings;
        Insert: Omit<UserPrivacySettings, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserPrivacySettings, "id" | "created_at" | "updated_at">>;
      };
      user_security_settings: {
        Row: UserSecuritySettings;
        Insert: Omit<UserSecuritySettings, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserSecuritySettings, "id" | "created_at" | "updated_at">>;
      };
      user_sessions: {
        Row: UserSession;
        Insert: Omit<UserSession, "id" | "created_at">;
        Update: Partial<Omit<UserSession, "id" | "created_at">>;
      };
      login_history: {
        Row: LoginHistory;
        Insert: Omit<LoginHistory, "id" | "created_at">;
        Update: Partial<Omit<LoginHistory, "id" | "created_at">>;
      };
      blocked_users: {
        Row: BlockedUser;
        Insert: { user_id: string; blocked_user_id: string; reason?: string };
        Update: Partial<{ user_id: string; blocked_user_id: string; reason?: string }>;
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: Omit<SupportTicket, "id" | "created_at">;
        Update: Partial<Omit<SupportTicket, "id" | "created_at">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
