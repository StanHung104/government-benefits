// scripts/ingest.mjs - Batch Ingestion Pipeline
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error("找不到 .env.local 檔案");

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

// 待解析的政策清單（可隨時在此陣列增加或串接外部來源）
const rawPolicyBatch = [
  `【勞動部勞動力發展署】青年跨域就業補助
為協助年滿18至29歲初次尋職青年擴大求職範圍，若受僱地點與原日常居住地距離30公里以上，勞動部提供租屋補助與異地就業交通補助。
租屋補助按租賃契約房租金額之60%核實發給，每月最高發給新台幣 5,000 元，最長補助12個月；交通補助依距離每月發給 1,000 至 3,000 元。
申請資格須為失業連續達3個月或初次尋職青年，經公立就業服務機構推介成功受僱。
官方網站：https://www.wda.gov.tw`,

  `【經濟部產業發展署】住宅家電汰舊換新節能補助
為鼓勵民眾淘汰老舊家電並落實居家節能減碳，經濟部推動住宅節能家電補助。
凡民眾將老舊冷氣機、電冰箱汰換，並購買能源效率分級第1級之全新產品，配合廢四機回收程序，每台冷氣或冰箱定額補助新台幣 3,000 元。
發票開立日期須符合當年度公告期間，備妥統一發票、保證書、台電電費單及廢四機聯單向線上平台申辦。
官方網站：https://save3000.moeaea.gov.tw`,

  `【教育部體育署】青春動滋券常態化發放專案
為培養青年族群規律運動習慣，教育部每年常態化發放青春動滋券。
發放對象為年滿 16 至 22 歲之本國國民（以身分證字號查驗）。
每人每年定額發放新台幣 500 元電子抵用券，可用於「做運動」、「看比賽」等合作體育運動產業店家消費折抵。
至動滋網登記並經身分驗證通過後即可領取 QR Code 進行抵用。
官方網站：https://500.gov.tw`
];

async function ingestSingleText(rawText, index, total) {
  console.log(`\n==================================================`);
  console.log(`🚀 [${index + 1}/${total}] 正在處理第 ${index + 1} 筆政策文字...`);

  const prompt = `
你是一位精通政府政策與補助案的資料架構師。請嚴格解析以下原始文字，並轉換為符合資料庫 Schema 的單一 JSON 物件。

原始內容：
"""
${rawText}
"""

必須遵守的 JSON 結構規範：
{
  "program_code": "英數小寫短網址代碼（如 youth-cross-region-2026）",
  "name": "完整政策名稱",
  "short_name": "政策簡稱（10字以內）",
  "category_code": "分類代碼，僅從此挑選: [housing, child, education, employment, elderly, business]",
  "subcategory_code": null,
  "summary": "政策宗旨摘要（約60~100字）",
  "amount_desc": "補助金額重點摘要",
  "eligibility_summary": "條列式申請資格說明",
  "official_url": "官方網站連結，無則填 null",
  "provider_level": "CENTRAL 或 LOCAL",
  "provider_agency": "主辦機關名稱",
  "provider_department": null,
  "status": "ACTIVE",
  "is_featured": true
}

注意事項：僅回傳純 JSON 格式，嚴禁加入 markdown 標記（如 \`\`\`json）。
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API 回傳 HTTP ${res.status}: ${await res.text()}`);
  }

  const resJson = await res.json();
  let text = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(text);

  console.log(`✅ 解析成功: [${parsed.short_name}] -> ${parsed.program_code}`);

  const payload = {
    program_code: parsed.program_code,
    name: parsed.name,
    short_name: parsed.short_name,
    category_code: parsed.category_code,
    subcategory_code: null,
    summary: parsed.summary,
    amount_desc: parsed.amount_desc || null,
    eligibility_summary: parsed.eligibility_summary || null,
    official_url: parsed.official_url || null,
    provider_level: parsed.provider_level || "CENTRAL",
    provider_agency: parsed.provider_agency || "政府機關",
    provider_department: null,
    status: "ACTIVE",
    is_featured: true,
    last_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("programs")
    .upsert(payload, { onConflict: "program_code" });

  if (error) throw error;
  console.log(`💾 成功寫入資料庫: ${parsed.name}`);
}

async function main() {
  for (let i = 0; i < rawPolicyBatch.length; i++) {
    try {
      await ingestSingleText(rawPolicyBatch[i], i, rawPolicyBatch.length);
      // 避免 API 速率限制，間隔 1.5 秒
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`❌ 處理第 ${i + 1} 筆失敗:`, err.message);
    }
  }
  console.log("\n🎉 批次匯入完成！");
}

main();