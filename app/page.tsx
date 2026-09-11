import {
  getContactsData,
  getWaitlistData,
  getTastingFeedbackData,
  getSampleFeedbackData,
} from "@/lib/data";
import { getCustomers } from "@/lib/store";
import DashboardShell from "./components/DashboardShell";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [waitlistData, contactsData, tastingFeedbackData, sampleFeedbackData, customers] =
    await Promise.all([
      getWaitlistData(),
      getContactsData(),
      getTastingFeedbackData(),
      getSampleFeedbackData(),
      getCustomers(),
    ]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-[#1a0a00] text-[#f4e7c8]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold tracking-wide text-[#ffc60a]">RETROH</div>
            <div className="text-sm opacity-70">Dashboard</div>
          </div>
        </div>
      </header>

      <DashboardShell
        waitlist={waitlistData.entries}
        contacts={contactsData.entries}
        tastingFeedback={tastingFeedbackData.entries}
        sampleFeedback={sampleFeedbackData.entries}
        customers={customers}
        live={waitlistData.live}
      />
    </div>
  );
}
