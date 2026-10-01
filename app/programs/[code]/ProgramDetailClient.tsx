// app/programs/[code]/ProgramDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PROGRAMS as staticPrograms, Program } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export default function ProgramDetailClient({ code }: { code: string }) {
  // 1. 本地靜態清單尋找備援
  const initialProgram = staticPrograms.find((p) => p.program_code === code) || null;
  const [program, setProgram] = useState<Program | null>(initialProgram);
  const [isLoading, setIsLoading] = useState(!initialProgram);
  const [notFoundState, setNotFoundState] = useState(false);

  // 2. 客戶端向 Supabase 動態撈取單筆詳情（確保新資料庫記錄不報 404）
  useEffect(() => {
    async function fetchProgramDetail() {
      if (!supabase) {
        if (!initialProgram) setNotFoundState(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .eq("program_code", code)
          .single();

        if (error || !data) {
          if (!initialProgram) {
            setNotFoundState(true);
          }
        } else {
          setProgram(data as Program);
        }
      } catch (err) {
        console.error("載入政策詳情異常:", err);
        if (!initialProgram) setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgramDetail();
  }, [code, initialProgram]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse flex items-center gap-2">
          <span>●</span> 正在載入政策資訊...
        </div>
      </div>
    );
  }

  if (notFoundState || !program) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-4xl">🔍</span>
          <h1 className="text-xl font-bold text-slate-800">查無此補助方案</h1>
          <p className="text-xs text-slate-500">
            該方案可能尚未發布或連結代碼無效。
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            返回補助列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 頂部導覽 */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
          >
            ← 返回列表
          </Link>
          <span className="text-xs text-slate-400">{program.program_code}</span>
        </div>
      </header>

      {/* 核心內容 */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {program.category_name}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {program.provider_level === "CENTRAL" ? "中央主管機關" : "地方政府"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {program.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {program.summary}
          </p>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-medium">補助金額與額度</span>
            <span className="font-bold text-base sm:text-lg">{program.amount_desc}</span>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span> 申請資格概述
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {program.eligibility_summary || "依主辦機關最新公告資格為準。"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>🏛️</span> 主辦與來源
              </h2>
              <div className="text-xs text-slate-500 space-y-1">
                <p>資料等級：{program.provider_level === "CENTRAL" ? "中央主管政策" : "地方政府補助"}</p>
                <p>識別碼：<code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{program.id || program.program_code}</code></p>
              </div>
            </div>

            {program.official_url ? (
              <a
                href={program.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
              >
                前往官方申請網站 ↗
              </a>
            ) : (
              <span className="text-center py-2.5 px-4 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium">
                暫無外部直接連結
              </span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}