import ProgramDetailClient from "./ProgramDetailClient";
import { supabase } from "@/lib/supabase";

export async function generateStaticParams() {
  // 增加 null 防護，滿足 TypeScript 型別檢查
  if (!supabase) {
    console.warn("⚠️ Supabase client 尚未初始化，跳過預先渲染");
    return [];
  }

  const { data, error } = await supabase
    .from("programs")
    .select("program_code");

  if (error || !data) {
    console.error("Build 階段讀取 Supabase 失敗:", error);
    return [];
  }

  return data.map((p) => ({
    code: p.program_code,
  }));
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ProgramDetailClient code={code} />;
}