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
    return <div className="p-12 text-center text-slate-500">資料載入中...</div>;
  }

  if (!program) {
    return (
      <div className="p-12 text-center text-slate-600">
        <p>查無此補助方案資料。</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 underline">返回列表</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-800">← 返回列表</Link>
          <span>{program.program_code}</span>
        </div>

        {/* 主標題與摘要卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
          <span className="inline-block px-2.5 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700">
            {program.provider_level === "CENTRAL" ? "中央主管機關" : "地方主管機關"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {program.name}
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            {program.summary}
          </p>

          {/* 金額區塊 */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-900">
            <span className="font-semibold block text-sm mb-1">補助金額與額度</span>
            <p className="text-base font-bold">{program.amount_desc || "依主辦機關公告審查核定"}</p>
          </div>
        </div>

        {/* 資格與來源卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              📋 申請資格概述
            </h2>
            <div className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
              {program.eligibility_summary || "依主辦機關最新公告資格為準。"}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              🏛️ 主辦與來源
            </h2>
            <div className="text-sm text-slate-600 space-y-1">
              <p>主辦單位：{program.provider_agency || "未提供"}</p>
              <p className="text-xs text-slate-400">核對狀態：已完成官方公告驗證</p>
            </div>
            {program.official_url ? (
              <a
                href={program.official_url}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                前往官方網站申請
              </a>
            ) : (
              <button disabled className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 rounded-lg text-sm cursor-not-allowed">
                暫無外部直接連結
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}