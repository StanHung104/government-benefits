import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
你是一個專門分析台灣政府補助政策與電商導購的專家。
請將使用者提供的「政府政策/補助新聞/公文內容」，嚴格解析並輸出為合法的 JSON 格式。
不要輸出任何 Markdown 語法標記（如 \`\`\`json），只輸出純 JSON 字串。

輸出的 JSON 格式規範如下：
{
  "program_code": "英數與破折號組合的代碼，例如 residential-appliance-subsidy-2026",
  "name": "官方完整政策名稱",
  "short_name": "民間常見通稱（5-8字）",
  "category_code": "必須是 housing, childcare, education, employment, elderly, disability 之一",
  "category_name": "對應分類中文，例如 住屋與租屋、生育與育兒、教育與學習、就業與勞工、長者與長照、身障與弱勢",
  "summary": "100字以內的重點摘要，說明誰能領、領多少、核心好處",
  "provider_agency": "主責政府主管機關全銜，例如 經濟部能源署",
  "provider_level": "必須是 CENTRAL 或 LOCAL",
  "amount_desc": "具體金額描述，包含級距與加碼細節",
  "target": "明確條列適用對象與門檻條件（年齡、所得限制等）",
  "apply_period": "受理申請期間或常態受理說明",
  "apply_method": "具體申請管道（線上系統網址、郵寄地址或公所窗口）",
  "documents": [
    "需備文件項目 1",
    "需備文件項目 2"
  ],
  "official_url": "官方公告網址（若無明確網址，填寫主管機關官網網址）",
  "recommended_products": [
    {
      "id": "prod-auto-1",
      "title": "符合此補助情境的熱銷商品名稱",
      "price": 18900,
      "platform": "momo購物網",
      "tag": "一級能效",
      "affiliate_url": "#"
    },
    {
      "id": "prod-auto-2",
      "title": "第二項生活剛需商品名稱",
      "price": 12900,
      "platform": "PChome",
      "tag": "熱銷現貨",
      "affiliate_url": "#"
    }
  ]
}
`;

// 支援的模型候補清單，若遇到 503 自動輪替下一個節點
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-exp",
];

async function generateProgram(rawNews) {
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    console.log(`\n🔄 嘗試使用模型節點: ${modelName}...`);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`⏳ 正在生成解析 (第 ${attempt} 次)...`);
        const result = await model.generateContent(
          `請解析以下補助資訊並生成規格化資料：\n\n${rawNews}`
        );
        const text = result.response.text();
        return JSON.parse(text);
      } catch (err) {
        lastError = err;
        const is503 = err.message.includes("503") || err.message.includes("high demand");
        if (is503 && attempt < maxRetries) {
          // 指數等待：第1次等 3 秒，第2次等 6 秒
          const waitTime = attempt * 3000;
          console.warn(`⚠️ 節點繁忙 (503)，等待 ${waitTime / 1000} 秒後重試...`);
          await new Promise((res) => setTimeout(res, waitTime));
        } else {
          console.warn(`⚠️ 模型 ${modelName} 無法連線 (${err.message.slice(0, 80)}...)，切換下一個候補節點...`);
          break; // 跳出此模型重試，改試 CANDIDATE_MODELS 的下一個
        }
      }
    }
  }

  throw new Error(`所有模型節點皆繁忙或不可用: ${lastError?.message}`);
}

async function main() {
  const testRawNews = `
  經濟部為鼓勵民眾汰換老舊家電並達到節電效益，持續推動「住宅家電汰舊換新節能補助」。
  民眾只要在住宅用電場所，將老舊之冷氣機、電冰箱汰換，並購買能源效率1級之全新冷氣或電冰箱，
  每台可補助新台幣 3,000 元整。
  若再搭配財政部貨物稅減免退稅政策，每台最高可再退 2,000 元，合計每台最高可省 5,000 元。
  申請人應備齊身分證影本、存摺影本、裝機地址證明、購買發票影本、保證書及廢四機回收聯單第三聯，
  透過經濟部線上申請專區或掛號郵寄送件申辦。
  `;

  try {
    const parsedData = await generateProgram(testRawNews);
    console.log("\n--- AI 解析結果預覽 ---");
    console.log(JSON.stringify(parsedData, null, 2));

    const outputPath = path.join(__dirname, "..", "lib", "programs_feed.json");
    let currentData = [];
    if (fs.existsSync(outputPath)) {
      currentData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    }

    currentData = currentData.filter((item) => item.program_code !== parsedData.program_code);
    currentData.unshift(parsedData);

    fs.writeFileSync(outputPath, JSON.stringify(currentData, null, 2), "utf-8");
    console.log(`\n✅ 成功寫入資料至: ${outputPath}`);
  } catch (err) {
    console.error("❌ 執行出錯:", err.message);
  }
}

main();