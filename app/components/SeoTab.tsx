"use client";

import { getGscEmbed } from "@/lib/config";
import EmbedReport from "./EmbedReport";

export default function SeoTab() {
  const { url, configured } = getGscEmbed();

  return (
    <EmbedReport
      title="SEO"
      description="Clicks, impressions, CTR, average position, top search queries and top landing pages, via Google Search Console."
      url={url}
      configured={configured}
      envVarName="NEXT_PUBLIC_GSC_LOOKER_URL"
      checkSource="gsc"
    />
  );
}
