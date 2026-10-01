// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// 正確的 Supabase 專案 Endpoint（中間為 cfl 單一 l）
const SUPABASE_URL = "https://zgrehehwcflpsjlxbzjy.supabase.co";
const SUPABASE_KEY = "sb_publishable_W6ceai7NyX6mOgVBv9U7cw_Fc1m6ub";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);