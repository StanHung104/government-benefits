// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "福利情報站 | 台灣政府補助與福利即時資訊庫",
    template: "%s | 福利情報站",
  },
  description:
    "整理全台中央與地方政府最新補助、津貼與減免方案。即時查詢租屋補貼、育兒津貼、青年就業、長照服務與節能補助資格、額度及申請入口。",
  keywords: [
    "政府補助",
    "台灣福利",
    "租屋補助",
    "育兒津貼",
    "動滋券",
    "節能補助",
    "就業獎勵",
    "長照補助",
    "學雜費減免",
  ],
  authors: [{ name: "福利情報站團隊" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "https://government-benefits.pages.dev",
    siteName: "福利情報站",
    title: "福利情報站 | 台灣政府補助與福利即時資訊庫",
    description: "找找看你能領哪些政府補助！彙整最新租屋、育兒、學費與創業補助資訊。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW">
      <body className="antialiased">{children}</body>
    </html>
  );
}