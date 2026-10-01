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
  `【財政部賦稅署】購買節能電器退還減徵貨物稅
民眾購買經經濟部核定能源效率分級為第1級或第2級之新電冰箱、新冷暖氣機或新除濕機非供銷銷售者，每台最高可退還減徵貨物稅新台幣 2,000 元。
補助額度：冷氣與冰箱最高退稅 2,000 元；除濕機退稅最高 1,200 元。可與經濟部汰舊換新補助 3,000 元疊加申請，單台最高現省 5,000 元。
申請資格：自然人購買一級或二級能效家電，自購買日起6個月內憑統一發票或收據向國稅局線上申請。
官方網站：https://www.etax.nat.gov.tw`,

  `【交通部公路局】行政院 TPASS 通勤月票方案
為減輕各都會生活圈通勤族負擔並推廣綠色公共運輸，交通部推行全國區域型 TPASS 通勤月票。
補助額度：基北北桃都會通每月 1,200 元；中彰投苗定期票每月 699 元起；南高屏跨區月票每月 999 元，享無限次搭乘捷運、台鐵、公車與公共自行車。
申請資格：一般民眾持悠遊卡、一卡通或專屬 TPASS 卡片均可至各捷運站或售票機開通加值。
官方網站：https://www.thb.gov.tw`,

  `【衛生福利部社會及家庭署】未滿2歲幼兒準公共托嬰與保母托育補助
協助送托公托或準公共化機構之育兒家庭減輕開銷負擔。
補助額度：送托準公共保母或托嬰中心，第一胎每月補助 13,000 元、第二胎 14,000 元、第三胎以上 15,000 元；送托公辦民營機構每月最高補助 7,000 元。
申請資格：未滿2歲兒童父母或監護人，且將幼童送托至簽訂合作契約之準公共居家托育人員或公托機構者。
官方網站：https://www.sfaa.gov.tw`,

  `【經濟部中小及新創企業署】青年創業及啟動金貸款利息補貼
鼓勵青年返鄉或創新創業，減輕創業初期利息負擔。
補助額度：貸款金額 100 萬元以內，享有前 5 年利息全額補貼（由經濟部全額支付利息），免保證人且可用簡易表單申請。
申請資格：年滿 18 歲至 45 歲國民，依法辦理商業登記或公司設立未滿 5 年，且修畢創業輔導課程 20 小時以上。
官方網站：https://www.sme.gov.tw`,

  `【衛生福利部社會及家庭署】身心障礙者與失能長者輔具購置及租賃補助
減輕失能者因購置輪椅、氣墊床、電動病床或助行器等輔具之經濟壓力。
補助額度：各項輔具依基準表定額補助，輕重度失能者每年最高補助新台幣 2 萬至 4 萬元不等。
申請資格：領有身心障礙證明或經長照管理中心評估為失能者，經專業輔具評估中心開立評估報告後提出申請。
官方網站：https://repat.sfaa.gov.tw`,

  `【環境部與各縣市環保局】老舊機車汰舊換新為電動機車補助
加速老舊燃油機車淘汰，改善空氣品質與落實低碳交通。
補助額度：中央環境部補助溫室氣體減量獎勵與回收金共約 3,800 元，疊加各直轄市地方加碼後，汰購最高補助 1 萬至 1.8 萬元不等。
申請資格：報廢 96 年 6 月 30 日前出廠之燃油機車，並新購審驗合格之重型或輕型電動機車者。
官方網站：https://epamotor.moenv.gov.tw`
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