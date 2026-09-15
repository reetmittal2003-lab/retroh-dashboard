// Pure aggregation over real TastingFeedbackEntry[]. Nothing in this file
// invents a number: every value returned is either a direct count/average
// of stored fields, or a percentage derived from those counts. Where the
// current form doesn't collect something (purchase intent, texture JAR,
// trial/batch id), the corresponding field is null/empty rather than
// guessed — callers must render an explicit "not collected yet" state.

import { TastingFeedbackEntry, ProductKey, ProductRating, PRODUCT_KEYS, PRODUCT_META } from "./types";

// ---------------------------------------------------------------------
// Small numeric helpers
// ---------------------------------------------------------------------

export function average(nums: (number | null | undefined)[]): number | null {
  const v = nums.filter((n): n is number => n != null);
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

export function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

function ratingsFor(entries: TastingFeedbackEntry[], key: ProductKey): ProductRating[] {
  return entries.map((e) => e.products[key]).filter((p): p is ProductRating => p != null);
}

function triedRatingsFor(entries: TastingFeedbackEntry[], key: ProductKey): ProductRating[] {
  return ratingsFor(entries, key).filter((p) => p.tried);
}

// ---------------------------------------------------------------------
// Per-product summary
// ---------------------------------------------------------------------

export type ProductSummary = {
  key: ProductKey;
  code: string;
  displayName: string | null;
  responses: number; // people who marked it as tried
  offered: number; // people the question was shown to (tried + skipped)
  overall: number | null;
  taste: number | null;
  texture: number | null;
  ratedCount: number; // how many of the "tried" responses actually carry a score
  sweetness: { tooSweet: number; justRight: number; notSweetEnough: number; total: number };
  aftertaste: { none: number; pleasant: number; unpleasant: number; total: number };
  price: Record<string, number>;
  notes: { text: string; respondentName: string; dateSubmitted: string }[];
};

export function summarizeProduct(entries: TastingFeedbackEntry[], key: ProductKey): ProductSummary {
  const meta = PRODUCT_META[key];
  const all = ratingsFor(entries, key);
  const tried = all.filter((p) => p.tried);
  const rated = tried.filter((p) => p.overall != null);

  const sweetnessCounts = { tooSweet: 0, justRight: 0, notSweetEnough: 0, total: 0 };
  const aftertasteCounts = { none: 0, pleasant: 0, unpleasant: 0, total: 0 };
  const priceCounts: Record<string, number> = {};

  for (const r of tried) {
    if (r.sweetness) {
      sweetnessCounts.total++;
      if (r.sweetness === "Too sweet") sweetnessCounts.tooSweet++;
      else if (r.sweetness === "Just right") sweetnessCounts.justRight++;
      else if (r.sweetness === "Not sweet enough") sweetnessCounts.notSweetEnough++;
    }
    if (r.aftertaste) {
      aftertasteCounts.total++;
      if (r.aftertaste === "None") aftertasteCounts.none++;
      else if (r.aftertaste === "Pleasant") aftertasteCounts.pleasant++;
      else if (r.aftertaste === "Unpleasant") aftertasteCounts.unpleasant++;
    }
    if (r.price) priceCounts[r.price] = (priceCounts[r.price] ?? 0) + 1;
  }

  const notes = entries
    .map((e) => ({ rating: e.products[key], entry: e }))
    .filter((x) => x.rating?.tried && x.rating.notes)
    .map((x) => ({
      text: x.rating.notes as string,
      respondentName: x.entry.respondentName || "Anonymous",
      dateSubmitted: x.entry.dateSubmitted,
    }));

  return {
    key,
    code: meta.code,
    displayName: meta.displayName,
    responses: tried.length,
    offered: all.length,
    overall: average(rated.map((r) => r.overall)),
    taste: average(tried.map((r) => r.taste)),
    texture: average(tried.map((r) => r.texture)),
    ratedCount: rated.length,
    sweetness: sweetnessCounts,
    aftertaste: aftertasteCounts,
    price: priceCounts,
    notes,
  };
}

export function summarizeAllProducts(entries: TastingFeedbackEntry[]): ProductSummary[] {
  return PRODUCT_KEYS.map((k) => summarizeProduct(entries, k));
}

// ---------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------

export type Overview = {
  totalResponses: number;
  totalTastings: number; // sum of "tried" across all products
  avgOverall: number | null;
  ratedTastings: number;
  bestProduct: { summary: ProductSummary; n: number } | null;
  worstProduct: { summary: ProductSummary; n: number } | null;
};

const MIN_N_FOR_RANKING = 3; // don't crown a "best" off 1 response

export function buildOverview(entries: TastingFeedbackEntry[]): Overview {
  const products = summarizeAllProducts(entries);
  const totalTastings = products.reduce((n, p) => n + p.responses, 0);
  const allOveralls = entries.flatMap((e) => PRODUCT_KEYS.map((k) => e.products[k]?.overall)).filter(
    (n): n is number => n != null
  );

  const ranked = products
    .filter((p) => p.ratedCount >= MIN_N_FOR_RANKING && p.overall != null)
    .sort((a, b) => (b.overall as number) - (a.overall as number));

  return {
    totalResponses: entries.length,
    totalTastings,
    avgOverall: average(allOveralls),
    ratedTastings: allOveralls.length,
    bestProduct: ranked.length ? { summary: ranked[0], n: ranked[0].ratedCount } : null,
    worstProduct:
      ranked.length > 1 ? { summary: ranked[ranked.length - 1], n: ranked[ranked.length - 1].ratedCount } : null,
  };
}

// ---------------------------------------------------------------------
// Sweetness JAR (this IS a real structured JAR-style question in the
// current form: Too sweet / Just right / Not sweet enough)
// ---------------------------------------------------------------------

export type SweetnessJar = {
  tooSweetPct: number | null;
  justRightPct: number | null;
  notSweetEnoughPct: number | null;
  n: number;
};

export function sweetnessJar(summary: ProductSummary): SweetnessJar {
  const { tooSweet, justRight, notSweetEnough, total } = summary.sweetness;
  return {
    tooSweetPct: pct(tooSweet, total),
    justRightPct: pct(justRight, total),
    notSweetEnoughPct: pct(notSweetEnough, total),
    n: total,
  };
}

// ---------------------------------------------------------------------
// Theme extraction from free-text notes — deterministic keyword rules,
// not an AI call. Every match keeps the original sentence as evidence.
// ---------------------------------------------------------------------

export type Theme =
  | "Sweetness"
  | "Texture"
  | "Taste"
  | "Aftertaste"
  | "Price / value"
  | "Nostalgia"
  | "Packaging"
  | "Other";
export type Sentiment = "positive" | "negative" | "neutral";

const THEME_RULES: { theme: Theme; sentiment: Sentiment; keywords: string[] }[] = [
  { theme: "Sweetness", sentiment: "negative", keywords: ["too sweet", "overly sweet", "sugary", "cloying"] },
  { theme: "Sweetness", sentiment: "negative", keywords: ["not sweet enough", "bland", "needs more sugar"] },
  { theme: "Texture", sentiment: "negative", keywords: ["too soft", "underbaked", "mushy", "not crunchy", "soggy"] },
  { theme: "Texture", sentiment: "negative", keywords: ["too hard", "too crunchy", "dry", "crumbly", "stale"] },
  { theme: "Texture", sentiment: "positive", keywords: ["crunchy", "crisp", "great texture", "perfect texture"] },
  { theme: "Taste", sentiment: "positive", keywords: ["delicious", "great taste", "loved the taste", "tasty", "flavour is strong", "flavourful"] },
  { theme: "Taste", sentiment: "negative", keywords: ["bland taste", "tasteless", "artificial", "chemical"] },
  { theme: "Aftertaste", sentiment: "negative", keywords: ["aftertaste lingered", "bad aftertaste", "bitter after"] },
  { theme: "Price / value", sentiment: "negative", keywords: ["too expensive", "overpriced", "pricey"] },
  { theme: "Price / value", sentiment: "positive", keywords: ["good value", "worth the price", "reasonably priced"] },
  { theme: "Nostalgia", sentiment: "positive", keywords: ["nostalgic", "childhood", "reminds me", "homemade", "like my mother", "like mom"] },
  { theme: "Packaging", sentiment: "neutral", keywords: ["packaging", "pack size", "wrapper"] },
];

const POSITIVE_HINTS = ["love", "loved", "great", "best", "perfect", "favourite", "favorite", "amazing", "excellent", "solid", "good"];
const NEGATIVE_HINTS = ["not memorable", "unfinished", "didn't stand out", "needs work", "too soft", "too sweet", "too hard", "unpleasant", "underbaked"];

export type ThemeMention = {
  theme: Theme;
  sentiment: Sentiment;
  respondentName: string;
  quote: string;
  productCode: string;
};

export function extractThemes(
  entries: TastingFeedbackEntry[],
  filterKey?: ProductKey
): ThemeMention[] {
  const mentions: ThemeMention[] = [];
  const keys = filterKey ? [filterKey] : PRODUCT_KEYS;

  for (const entry of entries) {
    for (const key of keys) {
      const rating = entry.products[key];
      if (!rating?.tried || !rating.notes) continue;
      const lower = rating.notes.toLowerCase();
      let matchedAny = false;

      for (const rule of THEME_RULES) {
        if (rule.keywords.some((kw) => lower.includes(kw))) {
          mentions.push({
            theme: rule.theme,
            sentiment: rule.sentiment,
            respondentName: entry.respondentName || "Anonymous",
            quote: rating.notes,
            productCode: PRODUCT_META[key].code,
          });
          matchedAny = true;
        }
      }

      // Structured signals that aren't free-text but are still real
      // answers: an explicit "too sweet"/"not sweet enough" is a
      // sweetness mention even with no comment text.
      if (rating.sweetness === "Too sweet" || rating.sweetness === "Not sweet enough") {
        mentions.push({
          theme: "Sweetness",
          sentiment: "negative",
          respondentName: entry.respondentName || "Anonymous",
          quote: rating.notes ?? `Rated sweetness "${rating.sweetness}"`,
          productCode: PRODUCT_META[key].code,
        });
        matchedAny = true;
      }
      if (rating.aftertaste === "Unpleasant") {
        mentions.push({
          theme: "Aftertaste",
          sentiment: "negative",
          respondentName: entry.respondentName || "Anonymous",
          quote: rating.notes ?? `Rated aftertaste "Unpleasant"`,
          productCode: PRODUCT_META[key].code,
        });
        matchedAny = true;
      }

      if (!matchedAny && rating.notes) {
        const sentiment: Sentiment = POSITIVE_HINTS.some((h) => lower.includes(h))
          ? "positive"
          : NEGATIVE_HINTS.some((h) => lower.includes(h))
          ? "negative"
          : "neutral";
        mentions.push({
          theme: "Other",
          sentiment,
          respondentName: entry.respondentName || "Anonymous",
          quote: rating.notes,
          productCode: PRODUCT_META[key].code,
        });
      }
    }
  }
  return mentions;
}

export type ThemeStat = {
  theme: Theme;
  total: number;
  positive: number;
  negative: number;
  pctOfComments: number | null;
  examples: ThemeMention[];
};

export function themeStats(mentions: ThemeMention[], totalComments: number): ThemeStat[] {
  const byTheme = new Map<Theme, ThemeMention[]>();
  for (const m of mentions) {
    if (!byTheme.has(m.theme)) byTheme.set(m.theme, []);
    byTheme.get(m.theme)!.push(m);
  }
  return Array.from(byTheme.entries())
    .map(([theme, list]) => ({
      theme,
      total: list.length,
      positive: list.filter((m) => m.sentiment === "positive").length,
      negative: list.filter((m) => m.sentiment === "negative").length,
      pctOfComments: pct(list.length, totalComments),
      examples: list.slice(0, 3),
    }))
    .sort((a, b) => b.total - a.total);
}

// ---------------------------------------------------------------------
// Strengths / Watch / Priorities classification — fixed thresholds
// applied to real computed percentages, not invented conclusions.
// ---------------------------------------------------------------------

export type PriorityBucket = "strength" | "watch" | "priority";

export function classifyTheme(stat: ThemeStat): PriorityBucket | null {
  if (stat.total < 2) return null; // not enough signal either way
  const negRate = stat.negative / stat.total;
  const posRate = stat.positive / stat.total;
  if (posRate >= 0.6 && stat.negative === 0) return "strength";
  if (negRate >= 0.5) return "priority";
  if (negRate >= 0.2) return "watch";
  return null;
}

// ---------------------------------------------------------------------
// Insights — template sentences, every number sourced from the above.
// ---------------------------------------------------------------------

export type Insight = { text: string; kind: "positive" | "negative" | "neutral" };

export function buildInsights(entries: TastingFeedbackEntry[]): Insight[] {
  const insights: Insight[] = [];
  const overview = buildOverview(entries);
  const products = summarizeAllProducts(entries);
  const mentions = extractThemes(entries);
  const totalComments = entries.flatMap((e) => PRODUCT_KEYS.map((k) => e.products[k]?.notes)).filter(Boolean).length;
  const themes = themeStats(mentions, totalComments || mentions.length);

  if (overview.bestProduct) {
    const p = overview.bestProduct.summary;
    insights.push({
      text: `${p.displayName ?? p.code} currently has the highest overall rating (${p.overall?.toFixed(1)}/5 across ${p.ratedCount} scored responses).`,
      kind: "positive",
    });
  }
  if (overview.worstProduct && overview.worstProduct.summary.key !== overview.bestProduct?.summary.key) {
    const p = overview.worstProduct.summary;
    insights.push({
      text: `${p.displayName ?? p.code} has the lowest overall rating so far (${p.overall?.toFixed(1)}/5 across ${p.ratedCount} scored responses).`,
      kind: "negative",
    });
  }

  for (const p of products) {
    const jar = sweetnessJar(p);
    if (jar.n >= 3 && jar.tooSweetPct != null && jar.tooSweetPct >= 30) {
      insights.push({
        text: `${p.displayName ?? p.code}: ${Math.round(jar.tooSweetPct)}% of tasters who rated sweetness said it was too sweet (${p.sweetness.tooSweet} of ${jar.n}).`,
        kind: "negative",
      });
    }
  }

  const topTheme = themes.find((t) => t.total >= 3 && t.negative / t.total >= 0.4);
  if (topTheme) {
    insights.push({
      text: `${topTheme.theme} is the most frequently mentioned improvement area across all products, raised in ${topTheme.negative} of ${totalComments || mentions.length} comments (${topTheme.pctOfComments?.toFixed(0)}%).`,
      kind: "negative",
    });
  }

  if (!insights.length) {
    insights.push({
      text: "Not enough responses yet to generate reliable insights. Insights appear automatically once there are a handful of rated responses per product.",
      kind: "neutral",
    });
  }

  return insights;
}

// ---------------------------------------------------------------------
// Trends over time — real, from dateSubmitted. No trial/batch id exists
// in the data today, so this is a plain time series, not a trial
// comparison (see TrialData below for why that's separate).
// ---------------------------------------------------------------------

export type TimePoint = { dateLabel: string; date: string; responses: number; avgOverall: number | null };

export function trendOverTime(entries: TastingFeedbackEntry[], bucketDays = 7): TimePoint[] {
  if (!entries.length) return [];
  const sorted = [...entries].sort(
    (a, b) => new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
  );
  const start = new Date(sorted[0].dateSubmitted);
  start.setHours(0, 0, 0, 0);
  const buckets = new Map<number, TastingFeedbackEntry[]>();
  for (const e of sorted) {
    const days = Math.floor((new Date(e.dateSubmitted).getTime() - start.getTime()) / 86400000);
    const bucketIdx = Math.floor(days / bucketDays);
    if (!buckets.has(bucketIdx)) buckets.set(bucketIdx, []);
    buckets.get(bucketIdx)!.push(e);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([idx, list]) => {
      const bucketStart = new Date(start.getTime() + idx * bucketDays * 86400000);
      const overalls = list.flatMap((e) => PRODUCT_KEYS.map((k) => e.products[k]?.overall)).filter(
        (n): n is number => n != null
      );
      return {
        dateLabel: bucketStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        date: bucketStart.toISOString(),
        responses: list.length,
        avgOverall: average(overalls),
      };
    });
}

// ---------------------------------------------------------------------
// Trial / batch comparison — the current form and Netlify data carry no
// trial/batch/campaign/source fields at all, so this always returns
// "not collected". Kept as a typed stub so the UI and future data wiring
// have a single place to hang this once those fields exist.
// ---------------------------------------------------------------------

export type TrialComparison = { available: false; reason: string };

export function trialComparison(): TrialComparison {
  return {
    available: false,
    reason:
      "No trial, batch, or campaign field is collected by the tasting form yet, so trial-vs-trial comparison has nothing to group by. Add trial/batch to the form (or the QR link) to unlock this.",
  };
}

// Purchase / repurchase intent — same situation: not asked today.
export type IntentSummary = { available: false; reason: string };
export function purchaseIntent(): IntentSummary {
  return {
    available: false,
    reason: "The tasting form doesn't ask a purchase-intent or repurchase-intent question yet.",
  };
}
