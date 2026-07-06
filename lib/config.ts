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
