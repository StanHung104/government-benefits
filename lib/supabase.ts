// lib/supabase.ts - Version 1.5
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase 環境變數未讀取到，請確認環境變數配置！");
}

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;