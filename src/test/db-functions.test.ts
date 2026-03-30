import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdminStats, listUsers, listContentReports, MOCK_STATS } from "@/lib/db/functions";

// Mock the supabase module since we want to ensure the functions fall back natively
vi.mock("@/lib/supabase", () => {
  return {
    isSupabaseConfigured: false,
    supabase: {
      from: vi.fn(),
      rpc: vi.fn(),
    }
  };
});

describe("Admin DB Functions - Mock Fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return mock admin stats when not configured", async () => {
    const stats = await getAdminStats();
    expect(stats.total_users).toBeGreaterThan(10000);
    expect(stats.revenue_7d).toBeGreaterThan(100000);
  });

  it("should return mock users when not configured", async () => {
    const users = await listUsers();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].name).toBe("Lucas Ferreira");
  });

  it("should correctly filter mock users by search", async () => {
    const users = await listUsers({ search: "ana" });
    expect(users.length).toBe(1);
    expect(users[0].name).toBe("Ana Souza");
  });

  it("should return mock reports when not configured", async () => {
    const reports = await listContentReports();
    expect(reports.length).toBeGreaterThan(0);
  });

  it("should filter mock reports by status", async () => {
    const pending = await listContentReports("pending");
    expect(pending.every(r => r.status === "pending")).toBe(true);

    const removed = await listContentReports("removed");
    expect(removed.every(r => r.status === "removed")).toBe(true);
  });
});
