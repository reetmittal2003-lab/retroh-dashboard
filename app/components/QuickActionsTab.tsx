"use client";

import { QUICK_ACTION_LINKS, getClarityDashboardUrl } from "@/lib/config";

export default function QuickActionsTab() {
  const clarity = getClarityDashboardUrl();

  const actions = [
    {
      title: "Google Analytics",
      description: "Jump into the GA4 property directly to dig deeper than the summary charts.",
      url: QUICK_ACTION_LINKS.googleAnalytics,
      configured: true,
    },
    {
      title: "Search Console",
      description: "Full Search Console UI for indexing, coverage, and query-level detail.",
      url: QUICK_ACTION_LINKS.searchConsole,
      configured: true,
    },
    {
      title: "Microsoft Clarity",
      description: "Open the Clarity project dashboard for recordings, heatmaps, and insights.",
      url: clarity.url,
      configured: clarity.configured,
    },
    {
      title: "Netlify Forms",
      description: "Manage forms, spam filtering, and notifications directly in Netlify.",
      url: QUICK_ACTION_LINKS.netlify,
      configured: true,
    },
    {
      title: "Vercel Dashboard",
      description: "Check deployments, logs, and environment variables for this project.",
      url: QUICK_ACTION_LINKS.vercel,
      configured: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        One-click launchers to the tools behind RETROH&apos;s data — each opens in a new tab.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <ActionCard key={action.title} {...action} />
        ))}
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  url,
  configured,
}: {
  title: string;
  description: string;
  url: string | undefined;
  configured: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      {configured && url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium px-4 py-2 rounded-full bg-[#ed1c24] text-white hover:opacity-90 w-fit"
        >
          Open {title}
        </a>
      ) : (
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 w-fit">
          Not connected
        </span>
      )}
    </div>
  );
}
