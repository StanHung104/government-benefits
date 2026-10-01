// app/page.tsx - Version 1.1
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PROGRAMS as initialPrograms, Program } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { code: "all", name: "全部方案", icon: "🌐" },
  { code: "housing", name: "住屋與租屋", icon: "🏠" },
  { code: "childcare", name: "生育與育兒", icon: "👶" },
  { code: "education", name: "教育與學習", icon: "🎓" },
  { code: "employment", name: "就業與勞工", icon: "💼" },
  { code: "elderly", name: "長者與長照", icon: "🧓" },
];

export default function Home() {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // 客戶端載入時即時向 Supabase 抓取最新資料
  useEffect(() => {
    async function fetchLatestPrograms() {
      if (!supabase) return;
      try {
        setIsSyncing(true);
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .order("id", { ascending: false });

        if (error) {
          console.warn("Supabase 讀取異常，保留本地資料備援:", error.message);
          return;
        }

        if (data && data.length > 0) {
          setPrograms(data as Program[]);
        }
      } catch (err) {
        console.warn("無法連線至 Supabase，維持展示本機快照:", err);
      } finally {
        setIsSyncing(false);
      }
    }

    fetchLatestPrograms();
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category_code === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.amount_desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [programs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 導覽列 */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-xl text-blue-600">福利情報站</span>
            <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
              台灣政府補助與福利即時資訊
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {isSyncing && <span className="animate-pulse text-blue-500">● 雲端同步中</span>}
            <span>開箱政策 · 補助民生</span>
          </div>
        </div>
      </header>

      {/* 主橫幅 */}
      <section className="py-12 px-4 text-center bg-gradient-to-b from-blue-50/50 to-transparent">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
            台灣政府補助與福利資料庫
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            找到你可能符合的<br />政府補助與福利
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            整理中央與地方政府公辦資訊，快速查詢補助資格、金額、申請方式與官方來源。
          </p>

          <div className="pt-2 max-w-lg mx-auto flex gap-2">
            <input
              type="text"
              placeholder="輸入關鍵字：租屋、育兒、家電、5000..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600"
              >
                清除
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 主體區塊 */}
      <main className="max-w-6xl mx-auto px-4 pb-20 space-y-8">
        {/* 分類清單 */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 mb-3">依分類篩選</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.code;
              return (
                <button
                  key={cat.code}
                  onClick={() => setSelectedCategory(cat.code)}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    active
                      ? "border-blue-600 bg-blue-50/40 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-semibold">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 方案清單 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-bold text-slate-800">
              {selectedCategory === "all"
                ? "所有補助方案"
                : CATEGORIES.find((c) => c.code === selectedCategory)?.name}
            </h2>
            <span className="text-xs text-slate-400">
              共找到 {filteredPrograms.length} 個方案
            </span>
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">找不到符合條件的補助項目</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrograms.map((item) => (
                <Link
                  key={item.program_code}
                  href={`/programs/${item.program_code}`}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                        {item.category_name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.provider_level === "CENTRAL" ? "中央" : "地方"}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-600 truncate max-w-[180px]">
                      {item.amount_desc}
                    </span>
                    <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition inline-flex items-center">
                      詳情 →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}