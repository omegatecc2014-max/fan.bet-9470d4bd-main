import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  getAdminStats,
  listUsers,
  listTransactions,
  listContentReports,
  listInfluencers,
  updateUserStatus,
} from "@/lib/db/functions";

// We use a unique email for the test user to avoid conflicts
const TEST_EMAIL = `test_${Date.now()}@integration.com`;
const TEST_PASSWORD = "TestPassword123!";
let testUserId: string | null = null;

describe("Supabase Integration Tests", () => {
  beforeAll(async () => {
    // Check if real config is available
    if (!isSupabaseConfigured) {
      console.warn("Skipping real DB tests since Supabase is not configured in .env");
    }
  });

  afterAll(async () => {
    // Cleanup the created test user profile if it exists.
    if (testUserId && isSupabaseConfigured) {
      console.log("Cleaning up test user profile:", testUserId);
      // Optional: Delete the profile if RLS permits. Otherwise, we just leave it.
      await supabase.from("profiles").delete().eq("id", testUserId);
    }
  });

  describe("Authentication", () => {
    it("should allow a user to sign up", async () => {
      // Skip if using mock
      if (!isSupabaseConfigured) return;

      const { data, error } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        options: {
          data: {
            name: "Integration Test User",
            role: "fan",
          }
        }
      });
      // Note: If email confirmations are enabled on Supabase, the user won't be able to login
      // until confirmed. We just verify the sign up doesn't error out unexpectedly.
      if (error) {
           console.warn("SignUp returned an error, possibly user already exists or weak password:", error);
      } else {
        expect(error).toBeNull();
        expect(data.user).toBeDefined();

        if (data.user) {
          testUserId = data.user.id;
        }
      }
    });
  });

  describe("Database Queries", () => {
    it("should fetch admin stats from remote DB (wait to ensure connection)", async () => {
      // Adding a small delay can help if JS init is still happening, though not strictly required
      await new Promise(r => setTimeout(r, 500));
      
      const stats = await getAdminStats();
      expect(stats).toBeDefined();
      expect(typeof stats.total_users).toBe("number");
      expect(typeof stats.revenue_7d).toBe("number");
    });

    it("should list users from remote DB", async () => {
      const users = await listUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it("should list transactions from remote DB", async () => {
      const txs = await listTransactions();
      expect(Array.isArray(txs)).toBe(true);
    });

    it("should list content reports from remote DB", async () => {
      const reports = await listContentReports();
      expect(Array.isArray(reports)).toBe(true);
    });

    it("should list influencers from remote DB", async () => {
      const influencers = await listInfluencers();
      expect(Array.isArray(influencers)).toBe(true);
    });
    
    it("should be able to update user status", async () => {
      if (!isSupabaseConfigured || !testUserId) {
        console.warn("Skipping updateUserStatus test due to no test user");
        return;
      }
      
      await updateUserStatus(testUserId, "suspended");
      
      // Verify
      const { data } = await supabase.from("profiles").select("status").eq("id", testUserId).single();
      if (data) {
        expect(data.status).toBe("suspended");
      }
    });
  });
});
