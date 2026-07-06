export type EmbedConfig = {
  url: string | undefined;
  configured: boolean;
};

function embed(url: string | undefined): EmbedConfig {
  return { url, configured: Boolean(url) };
}

export function getGa4Embed(): EmbedConfig {
  return embed(process.env.NEXT_PUBLIC_GA4_LOOKER_URL);
}

export function getGscEmbed(): EmbedConfig {
  return embed(process.env.NEXT_PUBLIC_GSC_LOOKER_URL);
}

export function getClarityRecordingsUrl(): EmbedConfig {
  return embed(process.env.NEXT_PUBLIC_CLARITY_RECORDINGS_URL);
}

export function getClarityHeatmapsUrl(): EmbedConfig {
  return embed(process.env.NEXT_PUBLIC_CLARITY_HEATMAPS_URL);
}

// Stable public entry points — always valid, no per-account configuration needed.
export const QUICK_ACTION_LINKS = {
  googleAnalytics: "https://analytics.google.com/",
  searchConsole: "https://search.google.com/search-console",
  netlify: "https://app.netlify.com/",
  vercel: "https://vercel.com/dashboard",
};

// Derives the Clarity project's dashboard URL from whichever Clarity
// embed URL is configured, so it doesn't need its own env var.
export function getClarityDashboardUrl(): EmbedConfig {
  const base =
    process.env.NEXT_PUBLIC_CLARITY_RECORDINGS_URL ||
    process.env.NEXT_PUBLIC_CLARITY_HEATMAPS_URL;
  if (!base) return { url: undefined, configured: false };
  try {
    const parsed = new URL(base);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const viewIndex = parts.indexOf("view");
    const projectId = viewIndex !== -1 ? parts[viewIndex + 1] : undefined;
    if (!projectId) return { url: undefined, configured: false };
    return { url: `${parsed.origin}/projects/view/${projectId}`, configured: true };
  } catch {
    return { url: undefined, configured: false };
  }
}
