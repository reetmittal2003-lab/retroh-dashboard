"use client";

import { getGa4Embed } from "@/lib/config";
import EmbedReport from "./EmbedReport";

export default function WebsiteTrafficTab() {
  const { url, configured } = getGa4Embed();

  return (
    <EmbedReport
      title="Website Traffic"
      description="Users, sessions, views, new users, traffic sources, device breakdown and traffic trends, via Google Analytics 4."
      url={url}
      configured={configured}
      envVarName="NEXT_PUBLIC_GA4_LOOKER_URL"
      checkSource="ga4"
    />
  );
}
