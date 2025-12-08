import { createClient } from "@supabase/supabase-js";

let supabase = null;

// This avoids initializing Supabase before dotenv loads ENV variables
export function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
      throw new Error("❌ Missing Supabase ENV variables");
    }

    supabase = createClient(url, key);
  }
  return supabase;
}
