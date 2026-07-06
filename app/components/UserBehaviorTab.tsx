"use client";

import { getClarityHeatmapsUrl, getClarityRecordingsUrl } from "@/lib/config";

export default function UserBehaviorTab() {
  const recordings = getClarityRecordingsUrl();
  const heatmaps = getClarityHeatmapsUrl();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Session recordings and heatmaps are hosted by Microsoft Clarity and open in a new tab.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ClarityButton
          title="Session Recordings"
          description="Watch real visitor sessions to see how people navigate the site."
          url={recordings.url}
          configured={recordings.configured}
          envVarName="NEXT_PUBLIC_CLARITY_RECORDINGS_URL"
        />
        <ClarityButton
          title="Heatmaps"
          description="See where visitors click, scroll and pay attention on each page."
          url={heatmaps.url}
          configured={heatmaps.configured}
          envVarName="NEXT_PUBLIC_CLARITY_HEATMAPS_URL"
        />
      </div>
    </div>
  );
}

function ClarityButton({
  title,
  description,
  url,
  configured,
  envVarName,
}: {
  title: string;
  description: string;
  url: string | undefined;
  configured: boolean;
  envVarName: string;
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
        <div>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 w-fit inline-block">
            Not connected
          </span>
          <p className="text-xs text-gray-400 mt-2">
            Set <code className="bg-gray-100 px-1.5 py-0.5 rounded">{envVarName}</code> to your
            Clarity project URL to enable this button.
          </p>
        </div>
      )}
    </div>
  );
}
