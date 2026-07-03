"use client";

import { useMemo } from "react";
import { WaitlistEntry } from "@/lib/types";

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function AnalyticsTab({ entries }: { entries: WaitlistEntry[] }) {
  const stats = useMemo(() => {
    const total = entries.length;
    const converted = entries.filter((e) => e.status === "Converted").length;
    const conversionRate = total ? Math.round((converted / total) * 1000) / 10 : 0;

    const byMonth = new Map<string, number>();
    entries.forEach((e) => {
      const key = monthKey(e.dateJoined);
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    });
    const months = Array.from(byMonth.keys()).sort();
    const monthly = months.map((key) => ({ key, label: monthLabel(key), count: byMonth.get(key)! }));

    const growthByMonth = months.reduce<{ key: string; label: string; cumulative: number }[]>(
      (acc, key) => {
        const previous = acc.at(-1)?.cumulative ?? 0;
        return [...acc, { key, label: monthLabel(key), cumulative: previous + byMonth.get(key)! }];
      },
      []
    );

    return { total, converted, conversionRate, monthly, growthByMonth };
  }, [entries]);

  const maxMonthly = Math.max(1, ...stats.monthly.map((m) => m.count));
  const maxGrowth = Math.max(1, ...stats.growthByMonth.map((m) => m.cumulative));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total waitlist signups" value={stats.total.toString()} />
        <StatCard label="Conversion rate" value={`${stats.conversionRate}%`} sub={`${stats.converted} converted`} />
        <StatCard
          label="This month's signups"
          value={(stats.monthly.at(-1)?.count ?? 0).toString()}
          sub={stats.monthly.at(-1)?.label}
        />
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Waitlist growth (cumulative)</h3>
        {stats.growthByMonth.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <svg viewBox="0 0 600 180" className="w-full h-40">
            <polyline
              fill="none"
              stroke="#ed1c24"
              strokeWidth="3"
              points={stats.growthByMonth
                .map((m, i) => {
                  const x = (i / Math.max(1, stats.growthByMonth.length - 1)) * 580 + 10;
                  const y = 170 - (m.cumulative / maxGrowth) * 150;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            {stats.growthByMonth.map((m, i) => {
              const x = (i / Math.max(1, stats.growthByMonth.length - 1)) * 580 + 10;
              const y = 170 - (m.cumulative / maxGrowth) * 150;
              return <circle key={m.key} cx={x} cy={y} r="4" fill="#ed1c24" />;
            })}
          </svg>
        )}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {stats.growthByMonth.map((m) => (
            <span key={m.key}>{m.label}</span>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly signups</h3>
        {stats.monthly.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-40">
            {stats.monthly.map((m) => (
              <div key={m.key} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full rounded-t-md bg-[#ffc60a]"
                  style={{ height: `${(m.count / maxMonthly) * 130}px` }}
                  title={`${m.count} signups`}
                />
                <span className="text-xs text-gray-500">{m.count}</span>
                <span className="text-xs text-gray-400">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
