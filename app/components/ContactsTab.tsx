"use client";

import { useMemo, useState } from "react";
import { ContactEntry } from "@/lib/types";
import StatusBanner from "./StatusBanner";

const STATUS_OPTIONS: ContactEntry["followUpStatus"][] = ["Open", "In progress", "Resolved"];

const STATUS_COLORS: Record<ContactEntry["followUpStatus"], string> = {
  Open: "bg-red-100 text-red-800",
  "In progress": "bg-amber-100 text-amber-800",
  Resolved: "bg-green-100 text-green-800",
};

export default function ContactsTab({
  initialEntries,
  live,
}: {
  initialEntries: ContactEntry[];
  live: boolean;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactEntry["followUpStatus"] | "All">("All");
  const [saveError, setSaveError] = useState<string | null>(null);

  async function updateFollowUp(id: string, followUpStatus: string) {
    const previous = entries;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, followUpStatus: followUpStatus as ContactEntry["followUpStatus"] } : e
      )
    );
    setSaveError(null);
    try {
      const res = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, followUpStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setEntries(previous);
      setSaveError("Couldn't save that follow-up status. Please try again.");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter((e) => {
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || e.followUpStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [entries, search, statusFilter]);

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
            onChange={(e) =>
              setStatusFilter(e.target.value as ContactEntry["followUpStatus"] | "All")
            }
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="All">All follow-up statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search name, email, subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Follow-up status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  {entries.length === 0
                    ? "No contact submissions yet."
                    : "No contacts match your search or filter."}
                </td>
              </tr>
            )}
            {filtered.map((entry) => {
              const isExpanded = expanded === entry.id;
              return (
                <tr key={entry.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {entry.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{entry.email}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{entry.subject || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : entry.id)}
                      className="text-left"
                    >
                      <span className={isExpanded ? "" : "line-clamp-2"}>{entry.message}</span>
                      {entry.message.length > 80 && (
                        <span className="text-xs text-blue-600 ml-1 whitespace-nowrap">
                          {isExpanded ? "Show less" : "Show more"}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={entry.followUpStatus}
                      onChange={(e) => updateFollowUp(entry.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${STATUS_COLORS[entry.followUpStatus]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
