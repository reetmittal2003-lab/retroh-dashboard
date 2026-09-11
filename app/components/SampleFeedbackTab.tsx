"use client";

import { useMemo, useState } from "react";
import { SampleFeedbackEntry } from "@/lib/types";
import StatusBanner from "./StatusBanner";

export default function SampleFeedbackTab({
  initialEntries,
  live,
}: {
  initialEntries: SampleFeedbackEntry[];
  live: boolean;
}) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return initialEntries;
    return initialEntries.filter(
      (e) =>
        e.cookie.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.contact.toLowerCase().includes(q)
    );
  }, [initialEntries, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <StatusBanner live={live} />
        <input
          type="text"
          placeholder="Search cookie, name, contact…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64"
        />
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Cookie</th>
              <th className="px-4 py-3 font-medium">Overall</th>
              <th className="px-4 py-3 font-medium">Taste</th>
              <th className="px-4 py-3 font-medium">Texture</th>
              <th className="px-4 py-3 font-medium">Sweetness</th>
              <th className="px-4 py-3 font-medium">Would buy</th>
              <th className="px-4 py-3 font-medium">Comments</th>
              <th className="px-4 py-3 font-medium">Respondent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  {initialEntries.length === 0
                    ? "No sample feedback yet."
                    : "No entries match your search."}
                </td>
              </tr>
            )}
            {filtered.map((entry) => {
              const isExpanded = expanded === entry.id;
              const comments = [
                entry.likedMost && `Liked most: ${entry.likedMost}`,
                entry.wouldChange && `Would change: ${entry.wouldChange}`,
                entry.anythingElse && `Anything else: ${entry.anythingElse}`,
              ]
                .filter(Boolean)
                .join("  ·  ");
              return (
                <tr key={entry.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {entry.cookie || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {entry.overall || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {entry.taste || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {entry.texture || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {entry.sweetness || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                        entry.wouldBuy === "Yes"
                          ? "bg-green-100 text-green-800"
                          : entry.wouldBuy === "No"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {entry.wouldBuy || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    {comments ? (
                      <button onClick={() => setExpanded(isExpanded ? null : entry.id)} className="text-left">
                        <span className={isExpanded ? "" : "line-clamp-2"}>{comments}</span>
                        {comments.length > 80 && (
                          <span className="text-xs text-blue-600 ml-1 whitespace-nowrap">
                            {isExpanded ? "Show less" : "Show more"}
                          </span>
                        )}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <div>{entry.name || "—"}</div>
                    {entry.contact && <div className="text-xs text-gray-400">{entry.contact}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
