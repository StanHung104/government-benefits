import Link from "next/link";
import { notFound } from "next/navigation";
import { PROGRAMS, Program } from "@/lib/data";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const program = PROGRAMS.find((p: Program) => p.program_code === code);

  if (!program) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            ← 回首頁
          </Link>
          <div className="text-xs text-slate-400">福利情報站 補助專題</div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 補助官方詳細內容 */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {program.category_name}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {program.provider_level === "CENTRAL" ? "中央" : "地方"}
                </span>
                <span className="text-xs text-slate-400">
                  主管機關：{program.provider_agency}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">
                {program.name}
              </h1>

              {/* 核心金額區塊 */}
              <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="text-xs font-semibold text-amber-800">💰 補助金額與補貼額度</div>
                <div className="mt-1 text-lg font-bold text-amber-900">
                  {program.amount_desc}
                </div>
              </div>

              {/* 詳細申請規則 */}
              <div className="mt-8 space-y-6 text-sm">
                <section>
                  <h2 className="text-base font-bold text-slate-900">👤 適用對象與資格條件</h2>
                  <p className="mt-2 text-slate-600 leading-relaxed">{program.target}</p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900">📅 申請期限與時程</h2>
                  <p className="mt-2 text-slate-600 leading-relaxed">{program.apply_period}</p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900">📝 申請方式與管道</h2>
                  <p className="mt-2 text-slate-600 leading-relaxed">{program.apply_method}</p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-slate-900">📄 應備申請文件清單</h2>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
                    {program.documents.map((doc: string, idx: number) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t">
                <a
                  href={program.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  前往官方網站線上申辦 / 查看最新公告 ↗
                </a>
              </div>
            </div>
          </div>

          {/* 電商比價與推薦導購 */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">🔥 相關生活好物推薦</h2>
                <span className="text-[11px] text-slate-400">限時優惠</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                省下荷包！精選相關優惠商品比價清單
              </p>

              <div className="mt-5 space-y-4">
                {program.recommended_products.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                        {item.tag}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.platform}
                      </span>
                    </div>

                    <div className="mt-2 text-sm font-semibold text-slate-900 leading-snug">
                      {item.title}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-base font-bold text-rose-600">
                        NT$ {item.price.toLocaleString()}
                      </div>
                      <a
                        href={item.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        前往比價 ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-400 leading-relaxed">
              📌 本平台僅整理政府公開資訊與各大電商促銷，各項補助資格核准以主管機關為準，商品價格與庫存以各商城即時標示為準。
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}