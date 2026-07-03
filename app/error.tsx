"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-[#1a0a00] text-[#f4e7c8]">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="text-lg font-bold tracking-wide text-[#ffc60a]">RETROH</div>
          <div className="text-sm opacity-70">Dashboard</div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="border border-red-200 bg-red-50 rounded-xl p-6 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-red-800">Couldn&apos;t load dashboard data</h2>
          <p className="text-sm text-red-700">
            {error.message || "Something went wrong talking to Netlify."} Check that
            NETLIFY_ACCESS_TOKEN and NETLIFY_SITE_ID are set correctly in your environment.
          </p>
          <button
            onClick={() => unstable_retry()}
            className="self-start text-sm font-medium px-4 py-1.5 rounded-full bg-red-800 text-white hover:bg-red-900"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
