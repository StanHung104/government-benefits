import ProgramDetailClient from "./ProgramDetailClient";
import { supabase } from "@/lib/supabase";

// 關鍵：必須具名匯出 generateStaticParams 以支援 output: 'export'
export async function generateStaticParams() {
  if (!supabase) {
    console.warn("⚠️ Supabase client 未初始化，跳過預先渲染");
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