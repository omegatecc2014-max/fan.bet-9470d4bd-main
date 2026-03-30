import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://obgnnrkeuthrijdcudnm.supabase.co";
const supabaseAnonKey = "sb_publishable_Dpkz_Asc7o7bXBu42jWCPg_nMsY0eGL";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Creating user...");
  const { data, error } = await supabase.auth.signUp({
    email: "omegatecc2014@gmail.com",
    password: "382912",
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("User created successfully:", data.user?.id);

    // We try to update the user to have admin role, but without service_role key, 
    // it's likely to fail or be ignored by Supabase because app_metadata is restricted.
    console.log("Attempting to set user as admin...");
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: { role: "admin" } // user_metadata can be updated
    });

    if (updateError) {
      console.error("Error updating user metadata:", updateError.message);
    } else {
      console.log("User metadata updated:", updateData.user?.user_metadata);
    }
  }
}

main();
