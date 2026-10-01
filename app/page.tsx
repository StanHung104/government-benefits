"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Program {
  id: string;
  program_code: string;
  name: string;
  short_name: string;
  category_code: string;
  summary: string;
  amount_desc: string | null;
  provider_level: string;
  provider_agency: string;
}

const CATEGORIES = [
  { code: "all", name: "全部方案", icon: "🇹🇼" },
  { code: "housing", name: "住屋租屋", icon: "🏠" },
  { code: "child", name: "生育育兒", icon: "👶" },
  { code: "education", name: "教育就學", icon: "🎓" },
  { code: "employment", name: "就業勞工", icon: "💼" },
  { code: "elderly", name: "長照銀髮", icon: "👵" },
  { code: "business", name: "企業創新", icon: "🌱" },
];

export default function HomePage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPrograms(data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredPrograms = programs.filter((item) => {
    const matchCategory =
      activeCategory === "all" || item.category_code === activeCategory;
    const matchKeyword =
      !searchKeyword.trim() ||
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (item.summary &&
        item.summary.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (item.amount_desc &&
        item.amount_desc.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchCategory && matchKeyword;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-lg shadow-sm shadow-emerald-200">
              🇹🇼
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                福利情報站
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  愛台灣・省荷包
                </span>
              </span>
              <p className="text-[11px] text-slate-400">台灣政府補助與福利即時資訊庫</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
            <span>🌿 陪伴生活的每一哩路</span>
          </div>
        </div>
      </header>

      {/* 溫暖 Hero 區塊 */}
      <section className="relative overflow-hidden pt-12 pb-14 bg-gradient-to-b from-amber-50/70 via-emerald-50/30 to-transparent">
        {/* 背景裝飾島嶼水印 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none text-[220px] font-black">
          🇹🇼
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-amber-200/80 text-amber-900 text-xs font-medium">
            <span>❤️</span>
            <span>每一筆補助，都是給在台灣認真生活的你最溫暖的應援</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            找找看，你能領哪些
            <span className="text-emerald-700 underline decoration-amber-400 decoration-4 underline-offset-4 ml-2">
              政府補助
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            不用再看密密麻麻的公文！我們整理中央與全台各縣市最新政策，幫你輕鬆省下租屋、育兒、學費與創業開銷。
          </p>

          {/* 搜尋框 */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-lg shadow-amber-900/5 rounded-2xl bg-white border border-amber-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all p-1.5">
              <span className="pl-3 pr-2 text-slate-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="輸入關鍵字：租金、育兒、冷氣、大專學費..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none py-2"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword("")}
                  className="px-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 主內容區 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        {/* 分類標籤 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              依需求類別探索
            </span>
            <span className="text-xs text-slate-500">
              共收錄 <strong className="text-emerald-700">{programs.length}</strong> 項福利方案
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.code;
              return (
                <button
                  key={cat.code}
                  onClick={() => setActiveCategory(cat.code)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.02]"
                      : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 卡片清單 */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            🌾 正在為您翻閱補助資料...
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-8">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-slate-600 font-medium">沒有找到符合條件的補助項目</p>
            <p className="text-xs text-slate-400 mt-1">試試看不同的關鍵字或重設分類</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map((item) => (
              <Link
                key={item.id}
                href={`/programs/${item.program_code}`}
                className="group flex flex-col justify-between bg-white rounded-2xl border border-amber-100 hover:border-emerald-300 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 p-5 relative overflow-hidden"
              >
                {/* 裝飾頂部彩條 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300 opacity-80" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {item.provider_agency || "政府機關"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.provider_level === "CENTRAL" ? "中央主管" : "地方政府"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* 金額亮點與進入詳情 */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-amber-700 font-medium block">
                      💰 補助額度
                    </span>
                    <span className="text-xs font-bold text-amber-900 truncate block">
                      {item.amount_desc || "詳見方案公告說明"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center whitespace-nowrap">
                    查看詳情 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 底部暖心 Footer */}
      <footer className="border-t border-amber-100 bg-white py-8 text-center text-xs text-slate-400 space-y-2">
        <p className="font-medium text-slate-500">🇹🇼 台灣補助情報站・用心陪伴每一個努力生活的家庭與企業</p>
        <p>本站資料彙整自政府機關最新公開政策，實際核定依各主辦主管機關最新辦法為準。</p>
      </footer>
    </div>
  );
}