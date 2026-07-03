"use client";

import { useMemo, useState } from "react";
import { Customer, CustomerType } from "@/lib/types";

const TYPES: CustomerType[] = ["Retailer", "Influencer", "Distributor"];

const TYPE_COLORS: Record<CustomerType, string> = {
  Retailer: "bg-purple-100 text-purple-800",
  Influencer: "bg-pink-100 text-pink-800",
  Distributor: "bg-cyan-100 text-cyan-800",
};

const EMPTY_FORM = {
  name: "",
  type: "Retailer" as CustomerType,
  email: "",
  phone: "",
  location: "",
  notes: "",
};

export default function CustomersTab({ initialEntries }: { initialEntries: Customer[] }) {
  const [customers, setCustomers] = useState(initialEntries);
  const [filter, setFilter] = useState<CustomerType | "All">("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => {
      const matchesType = filter === "All" || c.type === filter;
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [customers, filter, search]);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCustomers((prev) => [data.customer, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setSaveError("Couldn't save that customer. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const previous = customers;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setSaveError(null);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setCustomers(previous);
      setSaveError("Couldn't remove that customer. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {saveError && (
        <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {saveError}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {(["All", ...TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                filter === t
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search name, email, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64"
          />
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-sm font-medium px-4 py-1.5 rounded-full bg-[#ed1c24] text-white hover:opacity-90 whitespace-nowrap"
          >
            {showForm ? "Cancel" : "+ Add customer"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={submitForm}
          className="border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50"
        >
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CustomerType })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2"
          />
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2"
          />
          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-2 bg-gray-900 text-white text-sm font-medium rounded-lg py-2 hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save customer"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {customers.length === 0
                    ? "No customers yet."
                    : "No customers match your search or filter."}
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 align-top">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${TYPE_COLORS[c.type]}`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  <div>{c.email}</div>
                  <div className="text-xs text-gray-400">{c.phone}</div>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.location}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">{c.notes}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(c.id)}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
