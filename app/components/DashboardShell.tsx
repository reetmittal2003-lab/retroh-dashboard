"use client";

import { useState } from "react";
import { Customer, ContactEntry, WaitlistEntry, TastingFeedbackEntry, SampleFeedbackEntry } from "@/lib/types";
import WaitlistTab from "./WaitlistTab";
import ContactsTab from "./ContactsTab";
import TastingFeedbackTab from "./TastingFeedbackTab";
import SampleFeedbackTab from "./SampleFeedbackTab";
import CustomersTab from "./CustomersTab";
import AnalyticsTab from "./AnalyticsTab";
import ExecutiveSummaryTab from "./ExecutiveSummaryTab";
import WebsiteTrafficTab from "./WebsiteTrafficTab";
import SeoTab from "./SeoTab";
import UserBehaviorTab from "./UserBehaviorTab";
import QuickActionsTab from "./QuickActionsTab";

const TABS = [
  "Executive Summary",
  "Website Traffic",
  "SEO",
  "User Behavior",
  "Quick Actions",
  "Waitlist",
  "Contacts",
  "Tasting Feedback",
  "Sample Feedback",
  "Customers",
  "Analytics",
] as const;
export type Tab = (typeof TABS)[number];

export default function DashboardShell({
  waitlist,
  contacts,
  tastingFeedback,
  sampleFeedback,
  customers,
  live,
}: {
  waitlist: WaitlistEntry[];
  contacts: ContactEntry[];
  tastingFeedback: TastingFeedbackEntry[];
  sampleFeedback: SampleFeedbackEntry[];
  customers: Customer[];
  live: boolean;
}) {
  const [tab, setTab] = useState<Tab>("Executive Summary");

  return (
    <>
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                tab === t
                  ? "border-[#ed1c24] text-[#ed1c24]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "Executive Summary" && (
          <ExecutiveSummaryTab waitlist={waitlist} contacts={contacts} onNavigate={setTab} />
        )}
        {tab === "Website Traffic" && <WebsiteTrafficTab />}
        {tab === "SEO" && <SeoTab />}
        {tab === "User Behavior" && <UserBehaviorTab />}
        {tab === "Quick Actions" && <QuickActionsTab />}
        {tab === "Waitlist" && <WaitlistTab initialEntries={waitlist} live={live} />}
        {tab === "Contacts" && <ContactsTab initialEntries={contacts} live={live} />}
        {tab === "Tasting Feedback" && (
          <TastingFeedbackTab initialEntries={tastingFeedback} live={live} />
        )}
        {tab === "Sample Feedback" && (
          <SampleFeedbackTab initialEntries={sampleFeedback} live={live} />
        )}
        {tab === "Customers" && <CustomersTab initialEntries={customers} />}
        {tab === "Analytics" && <AnalyticsTab entries={waitlist} />}
      </main>
    </>
  );
}
