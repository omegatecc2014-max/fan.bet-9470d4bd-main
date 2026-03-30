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
export type TransactionType = "deposit" | "withdrawal";
export type TransactionStatus = "success" | "pending" | "failed" | "chargeback";
export type PaymentMethod = "PIX" | "Cartão" | "TED";
export type ContentType = "hint" | "chat" | "image";
export type ContentStatus = "pending" | "approved" | "removed";
export type DeviceType = "mobile" | "desktop" | "tablet";

// ── profiles ──────────────────────────────────────────────
export interface Profile {
  id: string;
  created_at: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  bet_count: number;
  verified: boolean;
  avatar_initials: string;
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
export interface Transaction {
  id: string;
  created_at: string;
  profile_id: string;
  profile_name: string;
  profile_avatar: string;
  type: TransactionType;
  method: PaymentMethod;
  amount: number;
  status: TransactionStatus;
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

// ── Supabase DB wrapper type ──────────────────────────────
export interface Database {
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
    };
  };
}
