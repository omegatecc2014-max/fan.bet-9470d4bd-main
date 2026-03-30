import { createClient } from "@supabase/supabase-js";const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log("Starting Supabase API tests...");
  let failCount = 0;

  // 1. Test Admin Stats RPC
  console.log("Testing Admin Stats RPC...");
  const { data: stats, error: errStats } = await supabase.rpc("fn_admin_stats");
  if (errStats) {
      console.error("Failed Admin Stats RPC:", errStats.message);
      failCount++;
  } else {
      console.log("Success: Admin Stats =", stats);
  }

  // 2. Test List Users
  console.log("Testing List Users...");
  const { data: users, error: errUsers } = await supabase.from("profiles").select("*").limit(5);
  if (errUsers) {
      console.error("Failed List Users:", errUsers.message);
      failCount++;
  } else {
      console.log(`Success: Found ${users?.length} users.`);
  }

  // 3. Test Transactions
  console.log("Testing List Transactions...");
  const { data: txs, error: errTxs } = await supabase.from("transactions").select("*").limit(5);
  if (errTxs) {
      console.error("Failed List Transactions:", errTxs.message);
      failCount++;
  } else {
      console.log(`Success: Found ${txs?.length} transactions.`);
  }

  console.log(`Tests finished. Failures: ${failCount}`);
  process.exit(failCount === 0 ? 0 : 1);
}

runTests();
