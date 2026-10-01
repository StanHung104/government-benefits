// app/sitemap.ts
import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://government-benefits.pages.dev";

  let programUrls: MetadataRoute.Sitemap = [];

  if (supabase) {
    const { data } = await supabase
      .from("programs")
      .select("program_code, updated_at");

    if (data) {
      programUrls = data.map((item) => ({
        url: `${baseUrl}/programs/${item.program_code}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...programUrls,
  ];
}