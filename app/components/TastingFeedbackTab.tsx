"use client";

import { useMemo, useState } from "react";
import { TastingFeedbackEntry, ProductKey, PRODUCT_KEYS, PRODUCT_META } from "@/lib/types";
import {
  summarizeAllProducts,
  buildOverview,
  sweetnessJar,
  extractThemes,
  themeStats,
  classifyTheme,
  buildInsights,
  trendOverTime,
  trialComparison,
  purchaseIntent,
  ProductSummary,
} from "@/lib/feedback-analysis";
import StatusBanner from "./StatusBanner";

// ---------------------------------------------------------------------
// CSV export — now carries every collected field, not just tried/not.
// ---------------------------------------------------------------------

function toCsvValue(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(entries: TastingFeedbackEntry[]) {
  const header = [
    "Name",
    "Email",
    "Age",
    "Submitted",
    ...PRODUCT_KEYS.flatMap((k) => {
      const code = PRODUCT_META[k].code;
      return [
        `${code} tried`,
        `${code} overall`,
        `${code} taste`,
        `${code} texture`,
        `${code} sweetness`,
        `${code} aftertaste`,
        `${code} price pref`,
        `${code} notes`,
      ];
    }),
  ];
  const rows = entries.map((e) => [
    e.respondentName,
    e.respondentEmail,
    e.respondentAge,
    new Date(e.dateSubmitted).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    ...PRODUCT_KEYS.flatMap((k) => {
      const p = e.products[k];
      return [
        p?.tried ? "yes" : "no",
        p?.overall?.toString() ?? "",
        p?.taste?.toString() ?? "",
        p?.texture?.toString() ?? "",
        p?.sweetness ?? "",
        p?.aftertaste ?? "",
        p?.price ?? "",
        p?.notes ?? "",
      ];
    }),
  ]);
  const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tasting-feedback.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------
// Small display primitives
// ---------------------------------------------------------------------

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-[#1a0a00] mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number | null; max?: number }) {
  const pct = value != null ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-20 text-xs font-medium text-gray-600 shrink-0">{label}</div>
      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-[#ed1c24]" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-10 text-right text-sm font-semibold text-[#1a0a00] tabular-nums">
        {value != null ? value.toFixed(1) : "—"}
      </div>
    </div>
  );
}

function ProductChip({ code, displayName }: { code: string; displayName: string | null }) {
  return (
    <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-amber-100 text-amber-900 whitespace-nowrap">
      {displayName ?? code}
    </span>
  );
}

const SUB_TABS = ["Overview", "Product Comparison", "Product Detail", "Trends", "Insights", "Responses"] as const;
type SubTab = (typeof SUB_TABS)[number];

export default function TastingFeedbackTab({
  initialEntries,
  live,
}: {
  initialEntries: TastingFeedbackEntry[];
  live: boolean;
}) {
  const [subTab, setSubTab] = useState<SubTab>("Overview");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>("1al");

  const overview = useMemo(() => buildOverview(initialEntries), [initialEntries]);
  const products = useMemo(() => summarizeAllProducts(initialEntries), [initialEntries]);
  const allMentions = useMemo(() => extractThemes(initialEntries), [initialEntries]);
  const totalComments = useMemo(
    () => initialEntries.flatMap((e) => PRODUCT_KEYS.map((k) => e.products[k]?.notes)).filter(Boolean).length,
    [initialEntries]
  );
  const themes = useMemo(() => themeStats(allMentions, totalComments || allMentions.length), [allMentions, totalComments]);
  const insights = useMemo(() => buildInsights(initialEntries), [initialEntries]);
  const trend = useMemo(() => trendOverTime(initialEntries), [initialEntries]);
  const trials = trialComparison();
  const intent = purchaseIntent();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return initialEntries;
    return initialEntries.filter(
      (e) =>
        e.respondentName.toLowerCase().includes(q) ||
        e.respondentEmail.toLowerCase().includes(q) ||
        e.triedSamples.some((s) => s.toLowerCase().includes(q))
    );
  }, [initialEntries, search]);

  const strengths = themes.filter((t) => classifyTheme(t) === "strength");
  const watch = themes.filter((t) => classifyTheme(t) === "watch");
  const priorities = themes.filter((t) => classifyTheme(t) === "priority");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <StatusBanner live={live} />
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search name, email, or sample…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64"
          />
          <button
            onClick={() => downloadCsv(filtered)}
            disabled={filtered.length === 0}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Export CSV ({filtered.length})
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition ${
              subTab === t ? "border-[#ed1c24] text-[#ed1c24]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {initialEntries.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-10 text-center text-gray-400">
          No tasting feedback yet. This page fills in automatically as responses come in.
        </div>
      ) : (
        <>
          {subTab === "Overview" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="Total responses" value={String(overview.totalResponses)} />
                <StatCard label="Product tastings logged" value={String(overview.totalTastings)} />
                <StatCard
                  label="Avg overall rating"
                  value={overview.avgOverall != null ? `${overview.avgOverall.toFixed(1)} / 5` : "—"}
                  sub={overview.ratedTastings ? `${overview.ratedTastings} scored` : "No scores yet"}
                />
                <StatCard
                  label="Best performing"
                  value={overview.bestProduct ? overview.bestProduct.summary.displayName ?? overview.bestProduct.summary.code : "Not enough data"}
                  sub={overview.bestProduct ? `${overview.bestProduct.summary.overall?.toFixed(1)}/5 · n=${overview.bestProduct.n}` : `Needs ≥3 scored responses per product`}
                />
                <StatCard label="Purchase intent" value="Not collected" sub={intent.reason} />
                <StatCard label="Repurchase intent" value="Not collected" sub={intent.reason} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-2">Top strengths</div>
                  {strengths.length ? (
                    <ul className="text-sm text-emerald-900 space-y-1">
                      {strengths.slice(0, 3).map((s) => (
                        <li key={s.theme}>
                          {s.theme} — {s.positive} of {s.total} mentions positive
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-emerald-700">Not enough comment volume yet.</div>
                  )}
                </div>
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                  <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">Watch</div>
                  {watch.length ? (
                    <ul className="text-sm text-amber-900 space-y-1">
                      {watch.slice(0, 3).map((s) => (
                        <li key={s.theme}>
                          {s.theme} — {s.negative} of {s.total} mentions negative
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-amber-700">Nothing borderline right now.</div>
                  )}
                </div>
                <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                  <div className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-2">Top improvement priority</div>
                  {priorities.length ? (
                    <ul className="text-sm text-red-900 space-y-1">
                      {priorities.slice(0, 3).map((s) => (
                        <li key={s.theme}>
                          {s.theme} — {s.negative} of {s.total} mentions negative
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-red-700">No statistically meaningful negative theme yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {subTab === "Product Comparison" && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Responses</th>
                    <th className="px-4 py-3 font-medium">Overall</th>
                    <th className="px-4 py-3 font-medium">Taste</th>
                    <th className="px-4 py-3 font-medium">Texture</th>
                    <th className="px-4 py-3 font-medium">Too sweet</th>
                    <th className="px-4 py-3 font-medium">Just right</th>
                    <th className="px-4 py-3 font-medium">Not sweet enough</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const jar = sweetnessJar(p);
                    return (
                      <tr key={p.key} className="align-top">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {p.displayName ?? <span className="text-gray-400">{p.code} (unnamed trial)</span>}
                          <div className="text-xs text-gray-400 font-normal">{p.code}</div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{p.responses}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold">{p.overall != null ? p.overall.toFixed(1) : "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{p.taste != null ? p.taste.toFixed(1) : "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{p.texture != null ? p.texture.toFixed(1) : "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{jar.tooSweetPct != null ? `${jar.tooSweetPct.toFixed(0)}%` : "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{jar.justRightPct != null ? `${jar.justRightPct.toFixed(0)}%` : "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{jar.notSweetEnoughPct != null ? `${jar.notSweetEnoughPct.toFixed(0)}%` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {subTab === "Product Detail" && (
            <ProductDetail
              products={products}
              selected={selectedProduct}
              onSelect={setSelectedProduct}
              mentions={allMentions}
            />
          )}

          {subTab === "Trends" && (
            <div className="flex flex-col gap-4">
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="text-sm font-semibold text-gray-700 mb-1">Response volume &amp; average rating over time</div>
                <div className="text-xs text-gray-400 mb-4">Grouped in 7-day buckets from the earliest response. Not a trial comparison — see note below.</div>
                {trend.length < 2 ? (
                  <div className="text-sm text-gray-400 py-8 text-center">
                    Not enough spread of submission dates yet to show a trend. This fills in as more responses arrive over time.
                  </div>
                ) : (
                  <TrendChart points={trend} />
                )}
              </div>
              <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Trial / batch comparison isn&apos;t available yet.</span> {trials.reason}
              </div>
            </div>
          )}

          {subTab === "Insights" && (
            <div className="flex flex-col gap-4">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 text-sm ${
                    ins.kind === "positive"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : ins.kind === "negative"
                      ? "border-red-200 bg-red-50 text-red-900"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  {ins.text}
                </div>
              ))}

              {themes.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3">What people are saying, by theme</div>
                  <div className="flex flex-col gap-3">
                    {themes.map((t) => (
                      <div key={t.theme} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-800">{t.theme}</span>
                          <span className="text-gray-500 tabular-nums">
                            {t.total} mentions · {t.positive} positive · {t.negative} negative
                          </span>
                        </div>
                        {t.examples.length > 0 && (
                          <ul className="mt-1.5 space-y-1">
                            {t.examples.map((ex, i) => (
                              <li key={i} className="text-xs text-gray-500 italic">
                                &ldquo;{ex.quote}&rdquo; — {ex.respondentName} ({ex.productCode})
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {subTab === "Responses" && (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Respondent</th>
                    <th className="px-4 py-3 font-medium">Age</th>
                    <th className="px-4 py-3 font-medium">Samples tried</th>
                    <th className="px-4 py-3 font-medium">Overall scores</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No entries match your search.
                      </td>
                    </tr>
                  )}
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {entry.respondentName || "—"}
                        <div className="text-xs text-gray-400 font-normal">{entry.respondentEmail || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{entry.respondentAge || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {entry.triedSamples.length === 0
                            ? "—"
                            : entry.triedSamples.map((s) => <ProductChip key={s} code={s} displayName={s} />)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-wrap gap-2 text-xs">
                          {PRODUCT_KEYS.map((k) => {
                            const p = entry.products[k];
                            if (!p?.tried) return null;
                            return (
                              <span key={k} className="tabular-nums">
                                {PRODUCT_META[k].code}: {p.overall != null ? `${p.overall}/5` : "no score"}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(entry.dateSubmitted).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductDetail({
  products,
  selected,
  onSelect,
  mentions,
}: {
  products: ProductSummary[];
  selected: ProductKey;
  onSelect: (k: ProductKey) => void;
  mentions: ReturnType<typeof extractThemes>;
}) {
  const p = products.find((x) => x.key === selected)!;
  const jar = sweetnessJar(p);
  const productMentions = mentions.filter((m) => m.productCode === p.code);
  const productThemes = themeStats(productMentions, productMentions.length);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {products.map((prod) => (
          <button
            key={prod.key}
            onClick={() => onSelect(prod.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              selected === prod.key
                ? "bg-[#1a0a00] text-[#f4e7c8] border-[#1a0a00]"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {prod.displayName ?? `${prod.code} (unnamed)`}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">Performance ({p.responses} tried, {p.ratedCount} scored)</div>
          <RatingBar label="Overall" value={p.overall} />
          <RatingBar label="Taste" value={p.taste} />
          <RatingBar label="Texture" value={p.texture} />
        </div>

        <div className="border border-gray-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-700 mb-1">Sweetness JAR</div>
          <div className="text-xs text-gray-400 mb-3">Just-About-Right analysis, n={jar.n}</div>
          {jar.n === 0 ? (
            <div className="text-sm text-gray-400">No sweetness ratings yet.</div>
          ) : (
            <div className="flex flex-col gap-2">
              <JarRow label="Too sweet" pct={jar.tooSweetPct} tone="warn" />
              <JarRow label="Just right" pct={jar.justRightPct} tone="good" />
              <JarRow label="Not sweet enough" pct={jar.notSweetEnoughPct} tone="warn" />
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">Aftertaste</div>
          {p.aftertaste.total === 0 ? (
            <div className="text-sm text-gray-400">No aftertaste ratings yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-2.5 py-1 rounded-full bg-gray-100">None: {p.aftertaste.none}</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">Pleasant: {p.aftertaste.pleasant}</span>
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800">Unpleasant: {p.aftertaste.unpleasant}</span>
            </div>
          )}
        </div>
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">Price preference (80g pack)</div>
          {Object.keys(p.price).length === 0 ? (
            <div className="text-sm text-gray-400">No price preference collected yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2 text-sm">
              {Object.entries(p.price).map(([k, n]) => (
                <span key={k} className="px-2.5 py-1 rounded-full bg-gray-100">
                  {k}: {n}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-4">
        <div className="text-sm font-semibold text-gray-700 mb-3">Comment themes for this product</div>
        {productThemes.length === 0 ? (
          <div className="text-sm text-gray-400">No comments yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {productThemes.map((t) => (
              <div key={t.theme} className="text-sm flex items-center justify-between">
                <span className="text-gray-700">{t.theme}</span>
                <span className="text-gray-500 tabular-nums">
                  {t.positive} positive · {t.negative} negative
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl p-4">
        <div className="text-sm font-semibold text-gray-700 mb-3">Comments ({p.notes.length})</div>
        {p.notes.length === 0 ? (
          <div className="text-sm text-gray-400">No written comments for this product yet.</div>
        ) : (
          <ul className="flex flex-col gap-3">
            {p.notes.map((n, i) => (
              <li key={i} className="text-sm border-l-2 border-gray-200 pl-3">
                <span className="text-gray-700">&ldquo;{n.text}&rdquo;</span>
                <div className="text-xs text-gray-400 mt-0.5">
                  {n.respondentName} · {new Date(n.dateSubmitted).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function JarRow({ label, pct, tone }: { label: string; pct: number | null; tone: "good" | "warn" }) {
  const color = tone === "good" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs text-gray-600 shrink-0">{label}</div>
      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct ?? 0}%` }} />
      </div>
      <div className="w-12 text-right text-sm font-semibold tabular-nums">{pct != null ? `${pct.toFixed(0)}%` : "—"}</div>
    </div>
  );
}

function TrendChart({ points }: { points: ReturnType<typeof trendOverTime> }) {
  const w = 640;
  const h = 160;
  const pad = 28;
  const maxResponses = Math.max(1, ...points.map((p) => p.responses));
  const stepX = (w - pad * 2) / Math.max(1, points.length - 1);
  const ratedPoints = points.filter((p) => p.avgOverall != null);
  const linePath = ratedPoints
    .map((p) => {
      const idx = points.indexOf(p);
      const x = pad + idx * stepX;
      const y = pad + (1 - (p.avgOverall as number) / 5) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40" role="img" aria-label="Response volume and rating trend">
      {points.map((p, i) => {
        const x = pad + i * stepX;
        const barH = (p.responses / maxResponses) * (h - pad * 2);
        return (
          <g key={p.date}>
            <rect x={x - 8} y={h - pad - barH} width={16} height={barH} rx={3} fill="#ffc60a" />
            <text x={x} y={h - pad + 14} fontSize={9} textAnchor="middle" fill="#6b7280">
              {p.dateLabel}
            </text>
          </g>
        );
      })}
      {ratedPoints.length >= 2 && (
        <polyline points={linePath} fill="none" stroke="#ed1c24" strokeWidth={2} />
      )}
      {ratedPoints.map((p) => {
        const idx = points.indexOf(p);
        const x = pad + idx * stepX;
        const y = pad + (1 - (p.avgOverall as number) / 5) * (h - pad * 2);
        return <circle key={p.date} cx={x} cy={y} r={3} fill="#ed1c24" />;
      })}
      <text x={pad} y={12} fontSize={9} fill="#9ca3af">
        Bars = responses · Line = avg overall (0–5)
      </text>
    </svg>
  );
}
