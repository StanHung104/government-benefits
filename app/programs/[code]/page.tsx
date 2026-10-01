// app/programs/[code]/page.tsx
import { PROGRAMS as staticPrograms } from "@/lib/data";
import ProgramDetailClient from "./ProgramDetailClient";

// 1. 提供靜態匯出所需的路由清單 (Server Component 專屬)
export function generateStaticParams() {
  return staticPrograms.map((item) => ({
    code: item.program_code,
  }));
}

// 2. 頁面入口：解包路由參數並交由 Client 元件動態查詢與渲染
export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ProgramDetailClient code={code} />;
}