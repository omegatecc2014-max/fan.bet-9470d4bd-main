/**
 * src/lib/db/functions.ts
 *
 * Typed Supabase function wrappers with stable function ID constants.
 * Every function falls back to local mock data when Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
  Profile, InfluencerProfile, Transaction,
  ContentReport, PageEvent, Notification, UserNotification, NotificationStats
} from "@/lib/database.types";

// ──────────────────────────────────────────────────────────
// Stable Function IDs (used as React Query cache keys)
// ──────────────────────────────────────────────────────────
export const FN_GET_ADMIN_STATS       = "fn_get_admin_stats"       as const;
export const FN_LIST_USERS            = "fn_list_users"            as const;
export const FN_LIST_TRANSACTIONS     = "fn_list_transactions"     as const;
export const FN_LIST_CONTENT_REPORTS  = "fn_list_content_reports"  as const;
export const FN_LIST_INFLUENCERS      = "fn_list_influencers"      as const;
export const FN_LIST_PAGE_EVENTS      = "fn_list_page_events"      as const;
export const FN_GET_ANALYTICS         = "fn_get_analytics"         as const;
export const FN_APPROVE_CONTENT       = "fn_approve_content"       as const;
export const FN_REMOVE_CONTENT        = "fn_remove_content"        as const;
export const FN_UPDATE_USER_STATUS    = "fn_update_user_status"    as const;
export const FN_UPDATE_INFLUENCER     = "fn_update_influencer"     as const;
export const FN_APPROVE_TRANSACTION   = "fn_approve_transaction"   as const;
export const FN_CREATE_USER           = "fn_create_user"           as const;
export const FN_DELETE_USER           = "fn_delete_user"           as const;
export const FN_GET_USER_HISTORY      = "fn_get_user_history"      as const;
export const FN_GET_USER_REPORTS      = "fn_get_user_reports"      as const;
export const FN_LIST_NOTIFICATIONS    = "fn_list_notifications"    as const;
export const FN_CREATE_NOTIFICATION   = "fn_create_notification"   as const;
export const FN_SEND_NOTIFICATION     = "fn_send_notification"     as const;
export const FN_CANCEL_NOTIFICATION   = "fn_cancel_notification"   as const;
export const FN_DELETE_NOTIFICATION    = "fn_delete_notification"   as const;
export const FN_GET_NOTIFICATION_DELIVERY = "fn_get_notification_delivery" as const;
export const FN_GET_NOTIFICATION_STATS = "fn_get_notification_stats" as const;

// ──────────────────────────────────────────────────────────
// Return types
// ──────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  active_users: number;
  new_users_7d: number;
  total_influencers: number;
  pending_moderation: number;
  revenue_7d: number;
  chargebacks: number;
}

export type UserFilters = {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type TransactionFilters = {
  status?: string;
  page?: number;
  pageSize?: number;
};

export type InfluencerWithProfile = InfluencerProfile & {
  profile: Pick<Profile, "name" | "email" | "status" | "avatar_initials">;
};

export interface AnalyticsData {
  monthlyGrowth: { month: string; users: number; revenue: number; bets: number }[];
  geoBreakdown: { country: string; users: number; pct: number; flag: string }[];
  cohort: { cohort: string; values: (number | null)[] }[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
}

export type NotificationFilters = {
  status?: string;
  target_type?: string;
  page?: number;
  pageSize?: number;
};

// ──────────────────────────────────────────────────────────
// Mock fallback data
// ──────────────────────────────────────────────────────────
const MOCK_STATS: AdminStats = {
  total_users: 12847, active_users: 11200, new_users_7d: 342,
  total_influencers: 94, pending_moderation: 5, revenue_7d: 148000, chargebacks: 7,
};

const MOCK_USERS: Profile[] = [
  { id: "u1", created_at: "2024-01-10T10:00:00Z", name: "Lucas Ferreira",  email: "lucas@email.com",  role: "fan",        status: "active",    balance: 240,   bet_count: 48,  verified: true,  avatar_initials: "LF" },
  { id: "u2", created_at: "2023-03-15T08:00:00Z", name: "Ana Souza",       email: "ana@email.com",    role: "influencer", status: "active",    balance: 12400, bet_count: 0,   verified: true,  avatar_initials: "AS" },
  { id: "u3", created_at: "2023-11-20T14:00:00Z", name: "João Pedro",      email: "joao@email.com",   role: "fan",        status: "suspended", balance: 0,     bet_count: 120, verified: false, avatar_initials: "JP" },
  { id: "u4", created_at: "2024-02-05T09:00:00Z", name: "Mariana Castro",  email: "mari@email.com",   role: "fan",        status: "active",    balance: 850,   bet_count: 23,  verified: true,  avatar_initials: "MC" },
  { id: "u5", created_at: "2024-06-01T11:00:00Z", name: "Rafael Oliveira", email: "rafael@email.com", role: "influencer", status: "pending",   balance: 3200,  bet_count: 0,   verified: false, avatar_initials: "RO" },
  { id: "u6", created_at: "2024-09-12T16:00:00Z", name: "Fernanda Lima",   email: "fern@email.com",   role: "fan",        status: "active",    balance: 95,    bet_count: 7,   verified: true,  avatar_initials: "FL" },
  { id: "u7", created_at: "2023-08-03T07:00:00Z", name: "Bruno Teixeira",  email: "bruno@email.com",  role: "fan",        status: "banned",    balance: 0,     bet_count: 312, verified: false, avatar_initials: "BT" },
  { id: "u8", created_at: "2024-10-18T13:00:00Z", name: "Carla Mendes",    email: "carla@email.com",  role: "fan",        status: "active",    balance: 430,   bet_count: 61,  verified: true,  avatar_initials: "CM" },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "TXN-8821", created_at: new Date(Date.now()-120000).toISOString(),   profile_id:"u1",profile_name:"Lucas Ferreira", profile_avatar:"LF",type:"deposit",   method:"PIX",    amount:250,   status:"success"    },
  { id: "TXN-8820", created_at: new Date(Date.now()-480000).toISOString(),   profile_id:"u2",profile_name:"Ana Souza",      profile_avatar:"AS",type:"withdrawal",method:"PIX",    amount:1200,  status:"pending"    },
  { id: "TXN-8819", created_at: new Date(Date.now()-900000).toISOString(),   profile_id:"u3",profile_name:"João Pedro",     profile_avatar:"JP",type:"deposit",   method:"Cartão", amount:100,   status:"failed"     },
  { id: "TXN-8818", created_at: new Date(Date.now()-1320000).toISOString(),  profile_id:"u4",profile_name:"Mariana Castro", profile_avatar:"MC",type:"deposit",   method:"PIX",    amount:500,   status:"success"    },
  { id: "TXN-8817", created_at: new Date(Date.now()-2280000).toISOString(),  profile_id:"u5",profile_name:"Rafael Oliveira",profile_avatar:"RO",type:"withdrawal",method:"TED",    amount:3200,  status:"success"    },
  { id: "TXN-8816", created_at: new Date(Date.now()-3600000).toISOString(),  profile_id:"u6",profile_name:"Fernanda Lima",  profile_avatar:"FL",type:"deposit",   method:"PIX",    amount:75,    status:"success"    },
  { id: "TXN-8815", created_at: new Date(Date.now()-7200000).toISOString(),  profile_id:"u7",profile_name:"Bruno Teixeira", profile_avatar:"BT",type:"deposit",   method:"Cartão", amount:200,   status:"chargeback" },
  { id: "TXN-8814", created_at: new Date(Date.now()-10800000).toISOString(), profile_id:"u8",profile_name:"Carla Mendes",   profile_avatar:"CM",type:"withdrawal",method:"PIX",    amount:430,   status:"pending"    },
];

const MOCK_REPORTS: ContentReport[] = [
  { id:"r1", created_at: new Date(Date.now()-300000).toISOString(),   author_name:"FlaBR",        author_avatar:"FB",content_type:"hint", content_text:"Flamengo vai ganhar por 2x1 no jogo de amanhã — análise completa dos últimos 5 jogos.", report_count:0, status:"pending",  resolved_by:null, resolved_at:null },
  { id:"r2", created_at: new Date(Date.now()-720000).toISOString(),   author_name:"AnonUser92",   author_avatar:"AU",content_type:"chat", content_text:"esse influencer é golpista não acreditem nele", report_count:3, status:"pending",  resolved_by:null, resolved_at:null },
  { id:"r3", created_at: new Date(Date.now()-1080000).toISOString(),  author_name:"PalmeirasTV",  author_avatar:"PT",content_type:"hint", content_text:"Palmeiras x São Paulo — empate no tempo normal. Odds excelentes no mercado de BTTS.", report_count:0, status:"pending",  resolved_by:null, resolved_at:null },
  { id:"r4", created_at: new Date(Date.now()-1500000).toISOString(),  author_name:"CruzeiroFan",  author_avatar:"CF",content_type:"image",content_text:"[Imagem anexada] — print de resultado antecipado suspeito", report_count:5, status:"pending",  resolved_by:null, resolved_at:null },
  { id:"r5", created_at: new Date(Date.now()-3600000).toISOString(),  author_name:"Marquinhos99", author_avatar:"MQ",content_type:"chat", content_text:"quem quiser dicas pagas entra no meu telegram @marquinhos_tips", report_count:8, status:"pending",  resolved_by:null, resolved_at:null },
  { id:"r6", created_at: new Date(Date.now()-7200000).toISOString(),  author_name:"SpamBot01",    author_avatar:"SB",content_type:"chat", content_text:"Ganhe dinheiro fácil clicando aqui...", report_count:12, status:"removed",  resolved_by:"Admin", resolved_at:new Date(Date.now()-5000000).toISOString() },
  { id:"r7", created_at: new Date(Date.now()-10800000).toISOString(), author_name:"CruzeiroBR",   author_avatar:"CB",content_type:"hint", content_text:"Análise do jogo: Cruzeiro vai empatar.", report_count:0, status:"approved", resolved_by:"Admin", resolved_at:new Date(Date.now()-9000000).toISOString() },
];

const MOCK_INFLUENCERS: InfluencerWithProfile[] = [
  { id:"i1",profile_id:"u2",created_at:"2023-03-15T08:00:00Z",handle:"@flabr",     followers:318000,subscribers:8400, accuracy_pct:71,hints_count:142,pending_hints:2, revenue_total:18900,tier:"gold",  bio:"O maior canal de dicas do Flamengo",  profile:{name:"FlaBR",       email:"flabr@influencer.com",  status:"active",   avatar_initials:"FB"} },
  { id:"i2",profile_id:"u2",created_at:"2024-01-10T08:00:00Z",handle:"@cruzeirobr",followers:245000,subscribers:5200, accuracy_pct:68,hints_count:98, pending_hints:0, revenue_total:12400,tier:"silver",bio:"Análises do Cruzeiro toda semana",  profile:{name:"CruzeiroBR",  email:"cbr@influencer.com",    status:"active",   avatar_initials:"CB"} },
  { id:"i3",profile_id:"u2",created_at:"2023-06-20T08:00:00Z",handle:"@palmtwitch",followers:198000,subscribers:4100, accuracy_pct:65,hints_count:76, pending_hints:1, revenue_total:9200, tier:"silver",bio:"PalmeirasTV — estatísticas e palpites",profile:{name:"PalmeirasTV", email:"ptv@influencer.com",    status:"active",   avatar_initials:"PT"} },
  { id:"i4",profile_id:"u2",created_at:"2023-11-05T08:00:00Z",handle:"@gremiofan", followers:142000,subscribers:2800, accuracy_pct:59,hints_count:54, pending_hints:0, revenue_total:6800, tier:"bronze",bio:"Gremio ao vivo e ao cubo",          profile:{name:"GremioFan",   email:"gf@influencer.com",     status:"active",   avatar_initials:"GF"} },
  { id:"i5",profile_id:"u5",created_at:"2025-01-08T08:00:00Z",handle:"@spfc_dicas",followers:87000, subscribers:0,    accuracy_pct:55,hints_count:31, pending_hints:5, revenue_total:3100, tier:null,    bio:"Novo canal São Paulo FC",            profile:{name:"SãoPauloFC",  email:"spfc@influencer.com",   status:"pending",  avatar_initials:"SP"} },
  { id:"i6",profile_id:"u5",created_at:"2025-03-01T08:00:00Z",handle:"@rafatips",  followers:24000, subscribers:0,    accuracy_pct:0, hints_count:0,  pending_hints:0, revenue_total:0,    tier:null,    bio:null,                                 profile:{name:"RafaOliveira",email:"rafael@email.com",        status:"pending",  avatar_initials:"RO"} },
  { id:"i7",profile_id:"u2",created_at:"2024-09-15T08:00:00Z",handle:"@galofan",   followers:64000, subscribers:890,  accuracy_pct:48,hints_count:22, pending_hints:0, revenue_total:1200, tier:"bronze",bio:"Atlético MG",                        profile:{name:"AtleticoFan", email:"atl@influencer.com",    status:"suspended",avatar_initials:"AF"} },
];

const MOCK_ANALYTICS: AnalyticsData = {
  monthlyGrowth: [
    { month:"Jan", users:8200,  revenue:98000,  bets:12400 },
    { month:"Fev", users:9100,  revenue:110000, bets:14200 },
    { month:"Mar", users:10400, revenue:127000, bets:16800 },
    { month:"Abr", users:9800,  revenue:118000, bets:15100 },
    { month:"Mai", users:11200, revenue:138000, bets:18400 },
    { month:"Jun", users:12847, revenue:165000, bets:22100 },
  ],
  geoBreakdown: [
    { country:"Brasil",    users:10214, pct:79.5, flag:"🇧🇷" },
    { country:"Portugal",  users:1840,  pct:14.3, flag:"🇵🇹" },
    { country:"Argentina", users:482,   pct:3.7,  flag:"🇦🇷" },
    { country:"EUA",       users:311,   pct:2.4,  flag:"🇺🇸" },
  ],
  cohort: [
    { cohort:"Jan 2025", values:[100,68,52,41,33,28] },
    { cohort:"Fev 2025", values:[100,71,55,44,36,null] },
    { cohort:"Mar 2025", values:[100,69,54,42,null,null] },
    { cohort:"Abr 2025", values:[100,73,57,null,null,null] },
    { cohort:"Mai 2025", values:[100,75,null,null,null,null] },
    { cohort:"Jun 2025", values:[100,null,null,null,null,null] },
  ],
  deviceBreakdown: { mobile:68, desktop:26, tablet:6 },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id:"n1", created_at: new Date(Date.now()-60000).toISOString(), title:"Manutenção Programada", message:"Sistema estará em manutenção das 02h às 04h.", type:"warning", target_type:"all", target_value:null, sent_by:"Admin", read_count:2847, total_recipients:5600, status:"sent" },
  { id:"n2", created_at: new Date(Date.now()-3600000).toISOString(), title:"Novos termos de uso", message:"Atualizamos nossos termos de uso. Por favor, revise.", type:"info", target_type:"all", target_value:null, sent_by:"Admin", read_count:1203, total_recipients:5600, status:"sent" },
  { id:"n3", created_at: new Date(Date.now()-86400000).toISOString(), title:"Bônus de boas-vindas", message:"Ganhe 100% no primeiro depósito! Use o código BONUS100.", type:"success", target_type:"fans", target_value:null, sent_by:"Marketing", read_count:892, total_recipients:5200, status:"sent" },
  { id:"n4", created_at: new Date(Date.now()-172800000).toISOString(), title:"Workshop para influenciadores", message:"Participe do workshop sobre estratégias de engajamento.", type:"info", target_type:"influencers", target_value:null, sent_by:"Admin", read_count:45, total_recipients:94, status:"sent" },
  { id:"n5", created_at: new Date(Date.now()-259200000).toISOString(), title:"Nova funcionalidade", message:"Em breve: chat ao vivo durante os jogos!", type:"system", target_type:"all", target_value:null, sent_by:"Dev Team", read_count:0, total_recipients:0, status:"draft" },
  { id:"n6", created_at: new Date(Date.now()-345600000).toISOString(), title:"Aviso importante", message:"Atualização de segurança obrigatória.", type:"error", target_type:"all", target_value:null, sent_by:"Admin", read_count:5580, total_recipients:5600, status:"sent" },
];

let mockUserNotifications: UserNotification[] = [
  { id:"un1", notification_id:"n1", user_id:"u1", user_email:"lucas@email.com", user_name:"Lucas Ferreira", delivered:true, delivered_at:new Date(Date.now()-60000).toISOString(), read:true, read_at:new Date(Date.now()-30000).toISOString(), created_at:new Date(Date.now()-60000).toISOString() },
  { id:"un2", notification_id:"n1", user_id:"u2", user_email:"ana@email.com", user_name:"Ana Souza", delivered:true, delivered_at:new Date(Date.now()-60000).toISOString(), read:true, read_at:new Date(Date.now()-20000).toISOString(), created_at:new Date(Date.now()-60000).toISOString() },
  { id:"un3", notification_id:"n1", user_id:"u3", user_email:"joao@email.com", user_name:"João Pedro", delivered:true, delivered_at:new Date(Date.now()-60000).toISOString(), read:false, read_at:null, created_at:new Date(Date.now()-60000).toISOString() },
  { id:"un4", notification_id:"n1", user_id:"u4", user_email:"mari@email.com", user_name:"Mariana Castro", delivered:true, delivered_at:new Date(Date.now()-60000).toISOString(), read:true, read_at:new Date(Date.now()-40000).toISOString(), created_at:new Date(Date.now()-60000).toISOString() },
  { id:"un5", notification_id:"n1", user_id:"u5", user_email:"rafael@email.com", user_name:"Rafael Oliveira", delivered:false, delivered_at:null, read:false, read_at:null, created_at:new Date(Date.now()-60000).toISOString() },
];

// ──────────────────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────────────────
function log(fnId: string, source: "supabase" | "mock") {
  if (source === "mock") {
    console.info(`[${fnId}] Running in MOCK mode — set VITE_SUPABASE_URL to connect to Supabase`);
  }
}

// ──────────────────────────────────────────────────────────
// Functions
// ──────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured) { log(FN_GET_ADMIN_STATS, "mock"); return MOCK_STATS; }
  const { data, error } = await supabase.rpc("fn_admin_stats");
  if (error) { console.error(FN_GET_ADMIN_STATS, error); return MOCK_STATS; }
  return data as AdminStats;
}

export async function listUsers(filters: UserFilters = {}): Promise<Profile[]> {
  if (!isSupabaseConfigured) {
    log(FN_LIST_USERS, "mock");
    let result = [...MOCK_USERS];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (filters.role && filters.role !== "all") result = result.filter(u => u.role === filters.role);
    if (filters.status && filters.status !== "all") result = result.filter(u => u.status === filters.status);
    return result;
  }
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (filters.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  if (filters.role && filters.role !== "all") query = query.eq("role", filters.role);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) { console.error(FN_LIST_USERS, error); return MOCK_USERS; }
  return data ?? MOCK_USERS;
}

export async function listTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  if (!isSupabaseConfigured) {
    log(FN_LIST_TRANSACTIONS, "mock");
    if (filters.status && filters.status !== "all") return MOCK_TRANSACTIONS.filter(t => t.status === filters.status);
    return MOCK_TRANSACTIONS;
  }
  let query = supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) { console.error(FN_LIST_TRANSACTIONS, error); return MOCK_TRANSACTIONS; }
  return data ?? MOCK_TRANSACTIONS;
}

export async function requestWithdrawal(
  amountTotal: number, 
  pixKey: string,
  options?: {
    pixKeyType?: "cpf" | "cnpj" | "email" | "phone" | "random";
    recipientName?: string;
    recipientBank?: string;
    convertedCurrency?: string;
    convertedAmount?: number;
    conversionRate?: number;
  }
): Promise<{ protocol: string; transactionId: string }> {
  const protocol = "SQT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const newTxn: Transaction = {
    id: "TXN-" + Math.floor(Math.random() * 10000),
    created_at: new Date().toISOString(),
    profile_id: "u1",
    profile_name: "Você (Atual)",
    profile_avatar: "VC",
    type: "withdrawal",
    method: "PIX",
    amount: amountTotal,
    status: "pending",
    pix_key: pixKey,
    pix_key_type: options?.pixKeyType || "cpf",
    pix_recipient_name: options?.recipientName,
    pix_recipient_bank: options?.recipientBank,
    converted_currency: options?.convertedCurrency,
    converted_amount: options?.convertedAmount,
    conversion_rate: options?.conversionRate,
    protocol: protocol
  };

  if (!isSupabaseConfigured) {
    MOCK_TRANSACTIONS.unshift(newTxn);
    return { protocol, transactionId: newTxn.id };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  let profileName = "Usuário";
  let profileAvatar = "US";
  let profileEmail = "";
  let profileDocument = "";
  
  if (user) {
    const { data: profile } = await (supabase as any).from("profiles").select("name, email, cpf, avatar_initials").eq("id", user.id).single();
    newTxn.profile_id = user.id;
    if (profile) {
      profileName = profile.name ?? "Usuário";
      profileAvatar = profile.avatar_initials ?? "US";
      profileEmail = profile.email ?? "";
      profileDocument = profile.cpf ?? "";
      newTxn.pix_recipient_name = options?.recipientName ?? profileName;
    }
    newTxn.profile_name = profileName;
    newTxn.profile_avatar = profileAvatar;
    newTxn.profile_email = profileEmail;
    newTxn.profile_document = profileDocument;
  }
  
  const insertData = {
    profile_id: newTxn.profile_id,
    profile_name: newTxn.profile_name,
    profile_avatar: newTxn.profile_avatar,
    profile_email: newTxn.profile_email,
    profile_document: newTxn.profile_document,
    type: newTxn.type,
    method: newTxn.method,
    amount: newTxn.amount,
    status: newTxn.status,
    pix_key: newTxn.pix_key,
    pix_key_type: newTxn.pix_key_type,
    pix_recipient_name: newTxn.pix_recipient_name,
    pix_recipient_bank: newTxn.pix_recipient_bank,
    converted_currency: newTxn.converted_currency,
    converted_amount: newTxn.converted_amount,
    conversion_rate: newTxn.conversion_rate,
    protocol: newTxn.protocol
  };
  
  const { data, error } = await (supabase as any).from("transactions").insert([insertData]).select("id, protocol").single();
  if (error) throw error;
  
  return { protocol: data?.protocol ?? protocol, transactionId: data?.id ?? "" };
}

export async function listContentReports(statusFilter?: string): Promise<ContentReport[]> {
  if (!isSupabaseConfigured) {
    log(FN_LIST_CONTENT_REPORTS, "mock");
    if (statusFilter) return MOCK_REPORTS.filter(r => r.status === statusFilter);
    return MOCK_REPORTS;
  }
  let query = supabase.from("content_reports").select("*").order("created_at", { ascending: false });
  if (statusFilter) query = query.eq("status", statusFilter);
  const { data, error } = await query;
  if (error) { console.error(FN_LIST_CONTENT_REPORTS, error); return MOCK_REPORTS; }
  return data ?? MOCK_REPORTS;
}

export async function approveContent(id: string): Promise<void> {
  if (!isSupabaseConfigured) { log(FN_APPROVE_CONTENT, "mock"); return; }
  const { error } = await (supabase as any).from("content_reports").update({
    status: "approved", resolved_by: "Admin", resolved_at: new Date().toISOString()
  }).eq("id", id);
  if (error) throw error;
}

export async function removeContent(id: string): Promise<void> {
  if (!isSupabaseConfigured) { log(FN_REMOVE_CONTENT, "mock"); return; }
  const { error } = await (supabase as any).from("content_reports").update({
    status: "removed", resolved_by: "Admin", resolved_at: new Date().toISOString()
  }).eq("id", id);
  if (error) throw error;
}

export async function updateUserStatus(id: string, status: Profile["status"]): Promise<void> {
  if (!isSupabaseConfigured) { log(FN_UPDATE_USER_STATUS, "mock"); return; }
  const { error } = await (supabase as any).from("profiles").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateInfluencerStatus(profileId: string, status: Profile["status"]): Promise<void> {
  if (!isSupabaseConfigured) { log(FN_UPDATE_INFLUENCER, "mock"); return; }
  const { error } = await (supabase as any).from("profiles").update({ status }).eq("id", profileId);
  if (error) throw error;
}

export async function createUser(data: { name: string; email: string; role: string }): Promise<void> {
  if (!isSupabaseConfigured) {
    log(FN_CREATE_USER, "mock");
    MOCK_USERS.unshift({
      id: "u" + Date.now(),
      created_at: new Date().toISOString(),
      name: data.name,
      email: data.email,
      role: data.role as any,
      status: "active",
      balance: 0,
      bet_count: 0,
      verified: true,
      avatar_initials: data.name.substring(0, 2).toUpperCase()
    });
    return;
  }
  const { error } = await (supabase as any).rpc("fn_create_user", {
    new_email: data.email,
    new_name: data.name,
    new_role: data.role,
    new_password: "tempPassword123" // Or handled differently
  });
  if (error) throw error;
}

export async function deleteUser(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    log(FN_DELETE_USER, "mock");
    const idx = MOCK_USERS.findIndex(u => u.id === id);
    if (idx !== -1) MOCK_USERS.splice(idx, 1);
    return;
  }
  const { error } = await (supabase as any).rpc("fn_delete_user", { target_id: id });
  if (error) throw error;
}

export async function getUserHistory(email: string): Promise<any[]> {
  if (!isSupabaseConfigured) {
    log(FN_GET_USER_HISTORY, "mock");
    return [
      { id: 1, created_at: new Date().toISOString(), page: "/dashboard", device: "desktop", session_duration_s: 120 },
      { id: 2, created_at: new Date(Date.now() - 3600000).toISOString(), page: "/wallet", device: "desktop", session_duration_s: 45 },
      { id: 3, created_at: new Date(Date.now() - 86400000).toISOString(), page: "/feed", device: "mobile", session_duration_s: 300 },
    ];
  }
  const { data, error } = await (supabase as any).rpc("fn_get_user_history", { target_email: email });
  if (error) throw error;
  return data || [];
}

export async function getUserContentReports(name: string): Promise<ContentReport[]> {
  if (!isSupabaseConfigured) {
    log(FN_GET_USER_REPORTS, "mock");
    return MOCK_REPORTS.filter(r => r.author_name === name);
  }
  const { data, error } = await (supabase as any).rpc("fn_get_user_reports", { target_name: name });
  if (error) throw error;
  return data || [];
}

export async function approveTransaction(id: string): Promise<void> {
  if (!isSupabaseConfigured) { 
    log(FN_APPROVE_TRANSACTION, "mock"); 
    return; 
  }
  
  const { data: tx, error: fetchError } = await (supabase as any)
    .from("transactions")
    .select("profile_id, profile_name, amount, protocol")
    .eq("id", id)
    .single();
    
  if (fetchError) throw fetchError;
  
  const { error } = await (supabase as any)
    .from("transactions")
    .update({ 
      status: "success",
      processed_at: new Date().toISOString(),
      processed_by: "Admin"
    })
    .eq("id", id);
    
  if (error) throw error;
  
  if (tx?.profile_id) {
    try {
      await sendUserNotification(
        tx.profile_id,
        "Saque Aprovado! 🎉",
        `Seu saque de R$ ${tx.amount?.toFixed(2)} foi aprovado e o pagamento será processado em breve. Protocolo: ${tx.protocol || id}`,
        "success"
      );
    } catch (e) {
      console.error("Failed to send notification:", e);
    }
  }
}

export async function listInfluencers(): Promise<InfluencerWithProfile[]> {
  if (!isSupabaseConfigured) { log(FN_LIST_INFLUENCERS, "mock"); return MOCK_INFLUENCERS; }
  const { data, error } = await supabase
    .from("influencer_profiles")
    .select("*, profile:profiles(name, email, status, avatar_initials)")
    .order("revenue_total", { ascending: false });
  if (error) { console.error(FN_LIST_INFLUENCERS, error); return MOCK_INFLUENCERS; }
  return (data as InfluencerWithProfile[]) ?? MOCK_INFLUENCERS;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  if (!isSupabaseConfigured) { log(FN_GET_ANALYTICS, "mock"); return MOCK_ANALYTICS; }
  return MOCK_ANALYTICS;
}

export async function listNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
  if (!isSupabaseConfigured) {
    log(FN_LIST_NOTIFICATIONS, "mock");
    let result = [...MOCK_NOTIFICATIONS];
    if (filters.status && filters.status !== "all") result = result.filter(n => n.status === filters.status);
    if (filters.target_type && filters.target_type !== "all") result = result.filter(n => n.target_type === filters.target_type);
    return result;
  }
  const { data, error } = await (supabase as any).rpc("fn_list_notifications", {
    p_status: filters.status || null,
    p_target_type: filters.target_type || null,
    p_limit: filters.pageSize || 50,
    p_offset: ((filters.page || 1) - 1) * (filters.pageSize || 50)
  });
  if (error) { console.error(FN_LIST_NOTIFICATIONS, error); return MOCK_NOTIFICATIONS; }
  return data ?? MOCK_NOTIFICATIONS;
}

export async function createNotification(data: {
  title: string;
  message: string;
  type?: string;
  target_type?: string;
  target_value?: string;
  send_now?: boolean;
}): Promise<string> {
  if (!isSupabaseConfigured) {
    log(FN_CREATE_NOTIFICATION, "mock");
    const newNotif: Notification = {
      id: "n" + Date.now(),
      created_at: new Date().toISOString(),
      title: data.title,
      message: data.message,
      type: (data.type || "info") as any,
      target_type: (data.target_type || "all") as any,
      target_value: data.target_value || null,
      sent_by: "Admin",
      read_count: 0,
      total_recipients: data.target_type === "all" ? 5600 : data.target_type === "influencers" ? 94 : data.target_type === "fans" ? 5200 : 0,
      status: data.send_now ? "sent" : "draft"
    };
    MOCK_NOTIFICATIONS.unshift(newNotif);
    return newNotif.id;
  }
  const { data: result, error } = await (supabase as any).rpc("fn_create_notification", {
    p_title: data.title,
    p_message: data.message,
    p_type: data.type || "info",
    p_target_type: data.target_type || "all",
    p_target_value: data.target_value || null,
    p_send_now: data.send_now || false
  });
  if (error) throw error;
  return result;
}

export async function sendNotification(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    log(FN_SEND_NOTIFICATION, "mock");
    const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (notif) {
      notif.status = "sent";
      notif.total_recipients = notif.target_type === "all" ? 5600 : notif.target_type === "influencers" ? 94 : notif.target_type === "fans" ? 5200 : 0;
    }
    return;
  }
  const { error } = await (supabase as any).rpc("fn_send_notification", { p_notification_id: id });
  if (error) throw error;
}

export async function cancelNotification(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    log(FN_CANCEL_NOTIFICATION, "mock");
    const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (notif) notif.status = "cancelled";
    return;
  }
  const { error } = await (supabase as any).rpc("fn_cancel_notification", { p_notification_id: id });
  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    log(FN_DELETE_NOTIFICATION, "mock");
    const idx = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
    if (idx !== -1) MOCK_NOTIFICATIONS.splice(idx, 1);
    return;
  }
  const { error } = await (supabase as any).rpc("fn_delete_notification", { p_notification_id: id });
  if (error) throw error;
}

export async function getNotificationDelivery(id: string): Promise<UserNotification[]> {
  if (!isSupabaseConfigured) {
    log(FN_GET_NOTIFICATION_DELIVERY, "mock");
    return mockUserNotifications.filter(un => un.notification_id === id);
  }
  const { data, error } = await (supabase as any).rpc("fn_get_notification_delivery", { p_notification_id: id });
  if (error) throw error;
  return data || [];
}

export async function getNotificationStats(id: string): Promise<NotificationStats> {
  if (!isSupabaseConfigured) {
    log(FN_GET_NOTIFICATION_STATS, "mock");
    const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (!notif) return { total_recipients: 0, delivered_count: 0, read_count: 0, delivery_rate: 0, read_rate: 0 };
    const deliveries = mockUserNotifications.filter(un => un.notification_id === id);
    const delivered = deliveries.filter(d => d.delivered).length;
    const read = deliveries.filter(d => d.read).length;
    return {
      total_recipients: notif.total_recipients,
      delivered_count: delivered,
      read_count: read,
      delivery_rate: notif.total_recipients > 0 ? (delivered / notif.total_recipients) * 100 : 0,
      read_rate: notif.total_recipients > 0 ? (read / notif.total_recipients) * 100 : 0
    };
  }
  const { data, error } = await (supabase as any).rpc("fn_get_notification_stats", { p_notification_id: id });
  if (error) throw error;
  return data?.[0] || { total_recipients: 0, delivered_count: 0, read_count: 0, delivery_rate: 0, read_rate: 0 };
}

export async function sendUserNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" | "system" = "info"
): Promise<string> {
  const notifId = "n" + Date.now();
  
  if (!isSupabaseConfigured) {
    const newNotif: Notification = {
      id: notifId,
      created_at: new Date().toISOString(),
      title,
      message,
      type: type as any,
      target_type: "specific_users",
      target_value: userId,
      sent_by: "Sistema",
      read_count: 0,
      total_recipients: 1,
      status: "sent"
    };
    MOCK_NOTIFICATIONS.unshift(newNotif);
    
    mockUserNotifications.unshift({
      id: "un" + Date.now(),
      notification_id: notifId,
      user_id: userId,
      user_email: "user@example.com",
      user_name: "Usuário",
      delivered: true,
      delivered_at: new Date().toISOString(),
      read: false,
      read_at: null,
      created_at: new Date().toISOString()
    });
    
    return notifId;
  }
  
  const { data, error } = await (supabase as any).rpc("fn_create_notification", {
    p_title: title,
    p_message: message,
    p_type: type,
    p_target_type: "specific_users",
    p_target_value: userId,
    p_send_now: true
  });
  
  if (error) throw error;
  return data || notifId;
}
