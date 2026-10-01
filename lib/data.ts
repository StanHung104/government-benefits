// 版本: v2 - 修正資料合併防禦機制與多來源載入
import rawFeedData from "./programs_feed.json";

export interface Product {
  id: string;
  title: string;
  price: number;
  platform: string;
  tag: string;
  affiliate_url: string;
}

export interface Program {
  id?: string;
  program_code: string;
  name: string;
  short_name: string;
  category_code: string;
  category_name: string;
  summary: string;
  provider_agency: string;
  provider_level: "CENTRAL" | "LOCAL";
  status?: string;
  is_featured?: boolean;
  amount_desc: string;
  eligibility_summary?: string;
  target: string;
  apply_period: string;
  apply_method: string;
  documents: string[];
  official_url: string;
  recommended_products: Product[];
}

const DEFAULT_PROGRAMS: Program[] = [
  {
    id: "1",
    program_code: "rent-subsidy-2026",
    name: "115年中央擴大租金補貼專案",
    short_name: "中央租屋補貼",
    category_code: "housing",
    category_name: "住屋與租屋",
    summary: "減輕無自有住宅家庭租屋負擔，按戶籍與身份級距每月補貼 2,000 至 8,000 元不等。",
    provider_agency: "內政部國土管理署",
    provider_level: "CENTRAL",
    status: "ACTIVE",
    is_featured: true,
    amount_desc: "每月 2,000 元至 8,000 元（依身分、縣市與級距加碼）",
    target: "家庭成員均無自有住宅、所得符合各縣市標準之租屋族群",
    apply_period: "隨到隨辦，全年皆可線上申請",
    apply_method: "內政部國土管理署線上申請系統、臨櫃或郵寄申請",
    documents: [
      "租賃契約影本（需載明承租人、租金、地址等完整資訊）",
      "承租人金融機構帳戶存摺封面影本",
      "身分證明文件（加碼身分證明，如中低收、身心障礙等）",
    ],
    official_url: "https://has.nlma.gov.tw/",
    recommended_products: [
      {
        id: "prod-1",
        title: "小資免打孔強力掛架/置物架（退租無痕不傷漆）",
        price: 399,
        platform: "蝦皮購物",
        tag: "租屋熱銷",
        affiliate_url: "#",
      },
      {
        id: "prod-2",
        title: "一級能效節能小容量除濕機（租屋防潮必備）",
        price: 3290,
        platform: "momo購物網",
        tag: "符合節能退稅",
        affiliate_url: "#",
      },
    ],
  },
  {
    id: "2",
    program_code: "childcare-subsidy-0-2",
    name: "未滿2歲兒童育兒津貼",
    short_name: "育兒津貼",
    category_code: "childcare",
    category_name: "生育與育兒",
    summary: "支持家庭養育子女，減輕經濟負擔，第一胎每月發放 5,000 元，第二胎以上加碼。",
    provider_agency: "衛生福利部社會及家庭署",
    provider_level: "CENTRAL",
    status: "ACTIVE",
    is_featured: true,
    amount_desc: "第一胎每月 5,000 元、第二胎每月 6,000 元、第三胎以上每月 7,000 元",
    target: "家中有未滿 2 歲本國籍幼兒，且未接受公共化或準公共托育服務者",
    apply_period: "常態受理，隨時可送件申請",
    apply_method: "幼兒戶籍地鄉鎮市區公所臨櫃申請，或衛福部線上申辦系統",
    documents: [
      "申請表及幼兒戶籍謄本或戶口名簿影本",
      "申請人身分證明文件及印章",
      "金融機構帳戶存摺封面影本",
    ],
    official_url: "https://www.sfaa.gov.tw/",
    recommended_products: [
      {
        id: "prod-4",
        title: "新生兒有機棉防踢被 / 包巾套組",
        price: 850,
        platform: "蝦皮商城",
        tag: "新手必備",
        affiliate_url: "#",
      },
    ],
  },
];

// 確保 feedData 解析為陣列
const parsedFeed: Program[] = Array.isArray(rawFeedData)
  ? (rawFeedData as Program[])
  : [];

// 合併：AI 產出優先置頂，其餘預設方案去重後排在後方
export const PROGRAMS: Program[] = [
  ...parsedFeed,
  ...DEFAULT_PROGRAMS.filter(
    (def) => !parsedFeed.some((f) => f.program_code === def.program_code)
  ),
];