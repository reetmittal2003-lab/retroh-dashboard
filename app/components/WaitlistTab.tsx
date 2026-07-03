"use client";

import { useMemo, useState } from "react";
import { WaitlistEntry } from "@/lib/types";
import StatusBanner from "./StatusBanner";

const STATUS_OPTIONS: WaitlistEntry["status"][] = [
  "New",
  "Contacted",
  "Converted",
  "Unsubscribed",
];

const STATUS_COLORS: Record<WaitlistEntry["status"], string> = {
  New: "bg-blue-100 text-blue-800",
  Contacted: "bg-amber-100 text-amber-800",
  Converted: "bg-green-100 text-green-800",
  Unsubscribed: "bg-gray-200 text-gray-600",
};

export default function WaitlistTab({
  initialEntries,
  live,
}: {
  initialEntries: WaitlistEntry[];
  live: boolean;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WaitlistEntry["status"] | "All">("All");
  const [saveError, setSaveError] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    const previous = entries;
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: status as WaitlistEntry["status"] } : e)));
    setSaveError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setEntries(previous);
      setSaveError("Couldn't save that status change. Please try again.");
    }
  }

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        const matchesSearch = e.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [entries, search, statusFilter]
  );

  return (
    <div className="flex flex-col gap-4">
      {saveError && (
        <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {saveError}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <StatusBanner live={live} />
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WaitlistEntry["status"] | "All")}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Date joined</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  {entries.length === 0
                    ? "No waitlist signups yet."
                    : "No signups match your search or filter."}
                </td>
              </tr>
            )}
            {filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{entry.email}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(entry.dateJoined).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-gray-600">{entry.source}</td>
                <td className="px-4 py-3">
                  <select
                    value={entry.status}
                    onChange={(e) => updateStatus(entry.id, e.target.value)}
                    className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${STATUS_COLORS[entry.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
