"use client";

import { useEffect, useState } from "react";

type CheckState = "checking" | "embeddable" | "blocked";

export default function EmbedReport({
  title,
  description,
  url,
  configured,
  envVarName,
  checkSource,
}: {
  title: string;
  description: string;
  url: string | undefined;
  configured: boolean;
  envVarName: string;
  checkSource: "ga4" | "gsc";
}) {
  const [state, setState] = useState<CheckState>("checking");

  useEffect(() => {
    if (!configured || !url) return;
    let cancelled = false;
    fetch(`/api/embed-check?source=${checkSource}`)
      .then((res) => res.json())
      .then((data: { embeddable: boolean }) => {
        if (!cancelled) setState(data.embeddable ? "embeddable" : "blocked");
      })
      .catch(() => {
        if (!cancelled) setState("blocked");
      });
    return () => {
      cancelled = true;
    };
  }, [configured, url, checkSource]);

  if (!configured || !url) {
    return (
      <div className="border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 w-fit mx-auto mb-4">
          Report not connected
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{description}</p>
        <p className="text-xs text-gray-400 mt-4">
          Set <code className="bg-gray-100 px-1.5 py-0.5 rounded">{envVarName}</code> to a
          public Looker Studio report embed URL to display it here.
        </p>
      </div>
    );
  }

  if (state === "blocked") {
    return (
      <div className="border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 w-fit mx-auto mb-4">
          Can&apos;t embed this report here
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Google is blocking this report from being displayed inside another page. Open it
          directly instead.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm font-medium px-4 py-2 rounded-full bg-[#ed1c24] text-white hover:opacity-90"
        >
          Open Report
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">{description}</p>
      <div className="w-full border border-gray-200 rounded-xl overflow-hidden relative aspect-[16/10] min-h-[420px]">
        {state === "checking" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-sm text-gray-400">
            Loading report…
          </div>
        )}
        <iframe
          src={url}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
        />
      </div>
    </div>
  );
}
