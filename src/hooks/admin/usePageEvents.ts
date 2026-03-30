import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FN_LIST_PAGE_EVENTS } from "@/lib/db/functions";

// Local fallback data
const MOCK_EVENTS = [
  ...Array(150).fill(0).map((_, i) => ({
    id: `ev-${i}`,
    page: ["feed", "rankings", "wallet", "profile", "influencer", "influencer/post-hint"][Math.floor(Math.random() * 6)],
    device: ["mobile", "mobile", "mobile", "desktop", "desktop", "tablet"][Math.floor(Math.random() * 6)] as any,
    session_duration_s: Math.floor(Math.random() * 600) + 30,
    country: "Brasil",
    created_at: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
  }))
];

export async function listPageEvents() {
  if (!isSupabaseConfigured) {
    console.info(`[${FN_LIST_PAGE_EVENTS}] Running in MOCK mode — set VITE_SUPABASE_URL to connect to Supabase`);
    return MOCK_EVENTS;
  }
  const { data, error } = await supabase.from("page_events").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) {
    console.error(FN_LIST_PAGE_EVENTS, error);
    return MOCK_EVENTS;
  }
  return data ?? MOCK_EVENTS;
}

export function usePageEvents() {
  return useQuery({
    queryKey: [FN_LIST_PAGE_EVENTS],
    queryFn: listPageEvents,
    staleTime: 60_000,
  });
}
