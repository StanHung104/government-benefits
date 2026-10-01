import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://zgrehehwcfllpsjlxbzjy.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_W6ceai7NyX6mOgVBv9U7cw_Fc1m6ub";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);