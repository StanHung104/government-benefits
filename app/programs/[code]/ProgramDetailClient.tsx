// app/programs/[code]/ProgramDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ProgramDetail {
  id: string;
  program_code: string;
  name: string;
  short_name: string;
  category_code: string;
  summary: string;
  amount_desc: string | null;
  eligibility_summary: string | null;
  official_url: string | null;
  provider_level: string;
  provider_agency: string;
  updated_at: string;
}

export default function ProgramDetailClient({ code }: { code: string }) {
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("program_code", code)
        .single();

      if (!error && data) {
        setProgram(data);
      }
      setLoading(false);
    }
    fetchDetail();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-slate-500 text-sm">
        🌾 方案詳情載入中...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-600 font-medium text-lg">查無此補助方案資料</p>
        <p className="text-slate-400 text-xs mt-1">該政策可能已截止或網址變更</p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium transition-colors"
        >
          返回福利情報站首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 麵包屑導覽 */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-emerald-700 font-medium transition-colors"
          >
            <span>← 返回所有方案</span>
          </Link>
          <span className="font-mono text-slate-400">{program.program_code}</span>
        </div>

        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
              {program.provider_level === "CENTRAL" ? "中央主管機關" : "地方主管機關"}
            </span>
            <span className="text-xs text-slate-400">
              {program.provider_agency}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {program.name}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {program.summary}
          </p>

          {/* 金額亮點 */}
          <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/80 p-5">
            <span className="text-xs font-bold text-amber-800 block mb-1">
              💰 補助金額與額度
            </span>
            <p className="text-base sm:text-lg font-bold text-amber-950 leading-relaxed">
              {program.amount_desc || "依主辦機關審查核定"}
            </p>
          </div>
        </div>

        {/* 雙欄卡片：資格與來源 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 申請資格 */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span> 申請資格概述
            </h2>
            <div className="text-slate-600 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
              {program.eligibility_summary || "依主辦機關最新公告資格為準。"}
            </div>
          </div>

          {/* 主辦來源與官方申請按鈕 */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🏛️</span> 主辦與來源
              </h2>
              <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                <p>主辦單位：{program.provider_agency || "政府機關"}</p>
                <p className="text-slate-400 text-xs">
                  核對狀態：官方公告核實
                </p>
              </div>
            </div>

            {program.official_url ? (
              <a
                href={program.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>前往官方網站申請</span>
                <span className="text-xs">↗</span>
              </a>
            ) : (
              <button
                disabled
                className="w-full py-3 px-4 bg-slate-100 text-slate-400 rounded-xl text-sm cursor-not-allowed"
              >
                暫無外部直接連結
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}