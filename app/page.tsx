"use client";

import { useState } from "react";
import Link from "next/link";
import { PROGRAMS, Program } from "@/lib/data";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = [
    { icon: "🌐", name: "全部方案", code: "ALL" },
    { icon: "🏠", name: "住屋與租屋", code: "housing" },
    { icon: "👶", name: "生育與育兒", code: "childcare" },
    { icon: "🎓", name: "教育與學習", code: "education" },
    { icon: "💼", name: "就業與勞工", code: "employment" },
    { icon: "👴", name: "長者與長照", code: "elderly" },
  ];

  // 根據搜尋文字與分類進行即時篩選
  const filteredPrograms = PROGRAMS.filter((item: Program) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provider_agency.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || item.category_code === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 頂部導航 */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-xl font-bold text-slate-900">福利情報站</div>
            <div className="text-xs text-slate-500">找到你可能符合的政府補助</div>
          </div>

          <nav className="flex gap-6 text-sm text-slate-600">
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchTerm("");
              }}
              className="hover:text-blue-600"
            >
              所有補助
            </button>
            <a href="#" className="hover:text-blue-600">熱門福利</a>
            <a href="#" className="hover:text-blue-600">家電退稅</a>
          </nav>
        </div>
      </header>

      {/* Hero 區塊與搜尋框 */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="mb-3 text-sm font-semibold text-blue-600">
            台灣政府補助與福利資料庫
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            找到你可能符合的
            <br />
            政府補助與福利
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-slate-500">
            整理中央與地方政府公開資訊，快速查詢補助資格、金額、申請方式與官方來源。
          </p>

          {/* 搜尋輸入框 */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex items-center rounded-2xl border bg-white p-2 shadow-lg focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="輸入關鍵字：租屋、育兒、家電、5000..."
                className="flex-1 px-4 py-3 text-sm outline-none bg-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mr-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  清除
                </button>
              )}
              <div className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white">
                搜尋
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 分類篩選按鈕 */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">依分類篩選</h2>
          <p className="text-xs text-slate-500">點擊分類按鈕快速切換</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.code;
            return (
              <button
                key={category.code}
                onClick={() => setSelectedCategory(category.code)}
                className={`rounded-xl border p-4 text-center transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="text-2xl">{category.icon}</div>
                <div className="mt-2 text-xs font-semibold">{category.name}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 補助方案清單 */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedCategory === "ALL" ? "所有補助方案" : "分類補助方案"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              共找到 {filteredPrograms.length} 個方案
            </p>
          </div>
        </div>

        {filteredPrograms.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
          {filteredPrograms.map((item: Program) => (
            <div
              key={item.program_code}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-600">
                      {item.category_name}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                      {item.provider_level === "CENTRAL" ? "中央" : "地方"}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    {item.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500 line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="text-xs text-slate-400">
                    主管機關：{item.provider_agency}
                  </div>
                  <Link
                    href={`/programs/${item.program_code}`}
                    className="mt-3 inline-block w-full rounded-xl bg-blue-50 py-2.5 text-center text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition"
                  >
                    查看詳細與導購優惠 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
            找不到符合「{searchTerm}」的補助方案，請嘗試其他關鍵字。
          </div>
        )}
      </section>

      {/* 頁腳 */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
          本網站為資訊整理平台，實際資格、金額與申請結果以政府主管機關最新公告為準。
        </div>
      </footer>
    </main>
  );
}