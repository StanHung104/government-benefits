import os
import json
from openai import OpenAI

# 建議將 API KEY 設為環境變數，或暫時在此替換測試
# 支援 OpenAI 或任何 OpenAI-compatible 的 API (如 DeepSeek, Groq, Ollama, OpenRouter)
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY", "你的_OPENAI_API_KEY_若無可設環境變數"),
    # base_url="https://api.openai.com/v1" # 若使用其他模型可抽換
)

SYSTEM_PROMPT = """
你是一個專門分析台灣政府補助政策與電商導購的專家。
請將使用者提供的「政府政策/補助新聞/公文內容」，嚴格解析並輸出為合法的 JSON 格式。
不要輸出任何 Markdown 語法標記（如 ```json ... ```），只輸出純 JSON 字串。

輸出的 JSON 格式規範如下：
{
  "program_code": "英數與破折號組合的代碼，例如 youth-rental-subsidy-2026",
  "name": "官方完整政策名稱",
  "short_name": "民間常見通稱（5-8字）",
  "category_code": "必須是 housing, childcare, education, employment, elderly, disability 之一",
  "category_name": "對應分類中文，例如 住屋與租屋、生育與育兒、教育與學習、就業與勞工、長者與長照、身障與弱勢",
  "summary": "100字以內的重點摘要，說明誰能領、領多少、核心好處",
  "provider_agency": "主責政府主管機關全銜，例如 勞動部勞動力發展署",
  "provider_level": "必須是 CENTRAL 或 LOCAL",
  "amount_desc": "具體金額描述，包含級距與加碼細節",
  "target": "明確條列適用對象與門檻條件（年齡、所得限制等）",
  "apply_period": "受理申請期間或常態受理說明",
  "apply_method": "具體申請管道（線上系統網址、郵寄地址或公所窗口）",
  "documents": [
    "需備文件項目 1",
    "需備文件項目 2"
  ],
  "official_url": "官方公告網址（若文章內無明確網址，填寫主管機關官網網址）",
  "recommended_products": [
    {
      "id": "prod-隨機英數",
      "title": "符合此族群剛需的推薦商品名稱（例如針對租屋族推薦免打孔架，育兒推薦溫奶器，就業推薦商務後背包）",
      "price": 899,
      "platform": "推薦電商平台（momo購物網、蝦皮商城、PChome 之一）",
      "tag": "四字亮點標籤（如 租屋熱銷、新手必備、求職首選）",
      "affiliate_url": "#"
    },
    {
      "id": "prod-隨機英數2",
      "title": "第二項生活好物推薦商品名稱",
      "price": 1490,
      "platform": "蝦皮商城",
      "tag": "限時折扣",
      "affiliate_url": "#"
    }
  ]
}
"""

def generate_program_from_raw_text(raw_text: str) -> dict:
    print("⏳ 正在調用 AI 分析政策並生成導購規格...")
    
    response = client.chat.completions.create(
        model="gpt-4o-mini", # 或 gpt-4o, deepseek-chat
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"請解析以下補助資訊並生成規格化資料：\n\n{raw_text}"}
        ],
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    
    result_text = response.choices[0].message.content
    data = json.loads(result_text)
    return data

def append_to_data_file(new_program: dict, target_path="../lib/data.json"):
    """將生成的資料儲存到 JSON 檔案"""
    if os.path.exists(target_path):
        with open(target_path, "r", encoding="utf-8") as f:
            current_data = json.load(f)
    else:
        current_data = []

    # 檢查是否已存在相同的 program_code
    current_data = [p for p in current_data if p.get("program_code") != new_program.get("program_code")]
    current_data.insert(0, new_program)

    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(current_data, f, ensure_ascii=False, indent=2)

    print(f"✅ 成功寫入方案：{new_program['name']} 至 {target_path}")

if __name__ == "__main__":
    # 測試示範範例：模擬一則勞動部「青年跨域就業津貼」的新聞或公告稿
    test_raw_news = """
    勞動部為協助18至29歲初次尋職之未就業青年跨域尋職就業，推動「青年跨域就業津貼」。
    凡經公立就業服務機構推介，並受僱於離家30公里以上地點之全時工作，
    連續受僱滿30日以上者即可申請。
    補助內容包含：
    1. 異地就業交通補助金：每月最高補助 3,000 元（最長發給12個月）。
    2. 搬遷補助金：每次最高發給 30,000 元核實補助。
    3. 租屋補助金：每月最高發給 5,000 元（最長發給12個月）。
    申請需準備身分證、租屋契約影本、薪資證明及各項單據，洽公立就業服務機構或台灣就業通網站申辦。
    """
    
    parsed_result = generate_program_from_raw_text(test_raw_news)
    print("\n--- AI 解析結果預覽 ---")
    print(json.dumps(parsed_result, ensure_ascii=False, indent=2))
    
    # 儲存到本地 data.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "..", "lib", "programs_feed.json")
    append_to_data_file(parsed_result, output_path)