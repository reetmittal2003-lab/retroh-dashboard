"use client";

import { useMemo, useState } from "react";
import { TastingFeedbackEntry } from "@/lib/types";
import StatusBanner from "./StatusBanner";

function toCsvValue(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadContactsCsv(entries: TastingFeedbackEntry[]) {
  const header = ["Name", "Email", "Age", "Samples tried", "Submitted"];
  const rows = entries.map((e) => [
    e.respondentName,
    e.respondentEmail,
    e.respondentAge,
    e.triedSamples.join("; "),
    new Date(e.dateSubmitted).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  ]);
  const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tasting-feedback-contacts.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function TastingFeedbackTab({
  initialEntries,
  live,
}: {
  initialEntries: TastingFeedbackEntry[];
  live: boolean;
}) {
  const [search, setSearch] = useState("");

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

  return (
    <div className="flex flex-col gap-4">
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
            onClick={() => downloadContactsCsv(filtered)}
            disabled={filtered.length === 0}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Export contact list (CSV)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Respondent</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium">Samples tried</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  {initialEntries.length === 0
                    ? "No tasting feedback yet."
                    : "No entries match your search."}
                </td>
              </tr>
            )}
            {filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 align-top">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {entry.respondentName || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {entry.respondentEmail || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {entry.respondentAge || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {entry.triedSamples.length === 0
                      ? "—"
                      : entry.triedSamples.map((s) => (
                          <span
                            key={s}
                            className="text-xs font-medium rounded-full px-2.5 py-1 bg-amber-100 text-amber-800"
                          >
                            {s}
                          </span>
                        ))}
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
    </div>
  );
}
