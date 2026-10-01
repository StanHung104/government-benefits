// scripts/ingest.mjs - Production Ingest Pipeline
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// 1. 安全讀取 .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("找不到 .env.local 檔案");
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zgrehehwcflpsjlxizjy.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!serviceRoleKey || !geminiApiKey) {
  console.error("❌ 缺少 SUPABASE_SERVICE_ROLE_KEY 或 GEMINI_API_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 2. 原始待解析文字
const rawPolicyText = `
【經濟部商業發展署】115年度商業服務業智慧減碳補助計畫
為協助商業服務業因應淨零排放趨勢，經濟部商業發展署推動智慧減碳補助計畫。
申請對象為依法設立登記之公司、商業、有限合夥，具備稅籍登記並於經濟部核准設立。
補助額度：小型企業最高補助新台幣 30 萬元；中大型連鎖商業服務業最高補助新台幣 150 萬元。
申請條件須提出具體減碳規劃與導入智慧節能設備方案。
詳細申請辦法與線上報名請參閱官方入口網站：https://www.esg-service.org.tw
`;

async function run() {
  const prompt = `
你是一位精通政府政策與補助案的資料架構師。請嚴格解析以下原始文字，並轉換為符合資料庫真實 Schema 的單一 JSON 物件。

原始內容：
"""
${rawPolicyText}
"""

必須遵守的 JSON 結構規範（欄位必須精確對應）：
{
  "program_code": "英數小寫短網址代碼，例如 esg-smart-reduction-2026",
  "name": "完整政策名稱",
  "short_name": "政策簡稱（10字以內）",
  "category_code": "分類代碼，請從中選擇最貼近的: [housing, child, education, employment, elderly, business]",
  "subcategory_code": null,
  "summary": "包含政策宗旨、補助金額（如小型企業最高30萬、連鎖最高150萬）與核心資格的完整摘要（約80~150字）",
  "provider_level": "主管層級，僅填 'CENTRAL' 或 'LOCAL'",
  "provider_agency": "主辦機關名稱（例如：經濟部商業發展署）",
  "provider_department": null,
  "status": "ACTIVE",
  "is_featured": true
}

注意事項：僅回傳純 JSON 格式，嚴禁加入 markdown 標記（如 \`\`\`json）。
`;

  let parsedData;

  try {
    console.log("🚀 [1/3] 正在呼叫 Gemini 模型 (gemini-flash-latest) 進行政策語意解析...");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API 回傳錯誤 HTTP ${res.status}: ${errText}`);
    }

    const resJson = await res.json();
    let text = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    parsedData = JSON.parse(text);
    console.log("✅ [2/3] AI 結構化解析成功：\n", JSON.stringify(parsedData, null, 2));
  } catch (err) {
    console.error("❌ AI 解析失敗:", err.message);
    process.exit(1);
  }

  // 3. 寫入 Supabase 資料庫 (欄位完全對齊 schema)
  console.log("💾 [3/3] 正在透過 Service Role 安全寫入 Supabase...");
  try {
    const payload = {
      program_code: parsedData.program_code,
      name: parsedData.name,
      short_name: parsedData.short_name,
      category_code: parsedData.category_code,
      subcategory_code: parsedData.subcategory_code || null,
      summary: parsedData.summary,
      provider_level: parsedData.provider_level || "CENTRAL",
      provider_agency: parsedData.provider_agency || "經濟部",
      provider_department: parsedData.provider_department || null,
      status: parsedData.status || "ACTIVE",
      is_featured: parsedData.is_featured ?? true,
      last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("programs")
      .upsert(payload, { onConflict: "program_code" })
      .select();

    if (error) throw error;

    console.log("🎉 成功寫入 Supabase 資料庫！異動紀錄：", data);
    console.log(`🔗 前端首頁查看：[https://government-benefits.pages.dev/](https://government-benefits.pages.dev/)`);
    console.log(`🔗 內頁預覽網址：[https://government-benefits.pages.dev/programs/$](https://government-benefits.pages.dev/programs/$){parsedData.program_code}`);
  } catch (err) {
    console.error("❌ Supabase 資料庫寫入異常:", err.message);
    process.exit(1);
  }
}

run();