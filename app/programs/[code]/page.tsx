// app/programs/[code]/page.tsx
import type { Metadata } from "next";
import ProgramDetailClient from "./ProgramDetailClient";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateStaticParams() {
  if (!supabase) return [];
  const { data } = await supabase.from("programs").select("program_code");
  return (data || []).map((p) => ({ code: p.program_code }));
}

// 1. 動態產生內頁專屬 SEO Title & Description
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  if (!supabase) return { title: "方案詳情" };

  const { data } = await supabase
    .from("programs")
    .select("name, summary, provider_agency, amount_desc")
    .eq("program_code", code)
    .single();

  if (!data) {
    return { title: "查無補助方案" };
  }

  return {
    title: `${data.name} - 資格、額度與申請辦法`,
    description: `${data.summary} ${data.amount_desc ? `【補助額度】${data.amount_desc}` : ""}`,
    openGraph: {
      title: data.name,
      description: data.summary,
      type: "article",
    },
  };
}

export default async function ProgramPage({ params }: Props) {
  const { code } = await params;

  // 取得資料庫資訊以產出 JSON-LD
  let jsonLd = null;
  if (supabase) {
    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("program_code", code)
      .single();

    if (data) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        "name": data.name,
        "serviceType": data.category_code,
        "description": data.summary,
        "provider": {
          "@type": "GovernmentOrganization",
          "name": data.provider_agency || "政府主管機關",
        },
        "url": `https://government-benefits.pages.dev/programs/${data.program_code}`,
      };
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProgramDetailClient code={code} />
    </>
  );
}