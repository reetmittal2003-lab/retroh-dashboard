"use client";

import { useMemo } from "react";
import { ContactEntry, WaitlistEntry } from "@/lib/types";
import { getLeadTotals, getLeadsByDay, getLeadsByWeek } from "@/lib/leads";
import { getClarityRecordingsUrl, getGa4Embed, getGscEmbed } from "@/lib/config";
import type { Tab } from "./DashboardShell";

export default function ExecutiveSummaryTab({
  waitlist,
  contacts,
  onNavigate,
}: {
  waitlist: WaitlistEntry[];
  contacts: ContactEntry[];
  onNavigate: (tab: Tab) => void;
}) {
  const totals = useMemo(() => getLeadTotals(waitlist, contacts), [waitlist, contacts]);
  const byDay = useMemo(() => getLeadsByDay(waitlist, contacts).slice(-14), [waitlist, contacts]);
  const byWeek = useMemo(() => getLeadsByWeek(waitlist, contacts).slice(-8), [waitlist, contacts]);

  const maxDay = Math.max(1, ...byDay.map((d) => d.total));
  const maxWeek = Math.max(1, ...byWeek.map((w) => w.total));

  const ga4 = getGa4Embed();
  const gsc = getGscEmbed();
  const clarity = getClarityRecordingsUrl();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total leads" value={totals.totalLeads.toString()} />
        <StatCard label="Waitlist signups" value={totals.totalWaitlist.toString()} />
        <StatCard label="Contact submissions" value={totals.totalContacts.toString()} />
        <StatCard
          label="Conversion rate"
          value={`${totals.conversionRate}%`}
          sub={`${totals.converted} converted`}
        />
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by day (last 14 days)</h3>
        {byDay.length === 0 ? (
          <p className="text-sm text-gray-400">No leads yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-40 overflow-x-auto">
            {byDay.map((d) => (
              <div key={d.key} className="flex flex-col items-center gap-1 flex-1 min-w-8">
                <div
                  className="w-full rounded-t-md bg-[#ffc60a]"
                  style={{ height: `${(d.total / maxDay) * 130}px` }}
                  title={`${d.total} leads (${d.waitlist} waitlist, ${d.contacts} contact)`}
                />
                <span className="text-xs text-gray-500">{d.total}</span>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by week</h3>
        {byWeek.length === 0 ? (
          <p className="text-sm text-gray-400">No leads yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-40 overflow-x-auto">
            {byWeek.map((w) => (
              <div key={w.key} className="flex flex-col items-center gap-1 flex-1 min-w-12">
                <div
                  className="w-full rounded-t-md bg-[#ed1c24]"
                  style={{ height: `${(w.total / maxWeek) * 130}px` }}
                  title={`${w.total} leads (${w.waitlist} waitlist, ${w.contacts} contact)`}
                />
                <span className="text-xs text-gray-500">{w.total}</span>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{w.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">More reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ReportLinkCard
            title="Website Traffic"
            description="Users, sessions, traffic sources and device breakdown from Google Analytics 4."
            configured={ga4.configured}
            onClick={() => onNavigate("Website Traffic")}
          />
          <ReportLinkCard
            title="SEO"
            description="Clicks, impressions, CTR and top queries from Google Search Console."
            configured={gsc.configured}
            onClick={() => onNavigate("SEO")}
          />
          <ReportLinkCard
            title="User Behavior"
            description="Session recordings and heatmaps from Microsoft Clarity."
            configured={clarity.configured}
            onClick={() => onNavigate("User Behavior")}
          />
        </div>
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

function ReportLinkCard({
  title,
  description,
  configured,
  onClick,
}: {
  title: string;
  description: string;
  configured: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {!configured && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">
            Setup needed
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
      <span className="text-xs font-medium text-[#ed1c24] mt-3 inline-block">View report →</span>
    </button>
  );
}
