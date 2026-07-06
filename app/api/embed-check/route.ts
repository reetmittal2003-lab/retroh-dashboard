import { NextRequest, NextResponse } from "next/server";

const SOURCES = {
  ga4: "NEXT_PUBLIC_GA4_LOOKER_URL",
  gsc: "NEXT_PUBLIC_GSC_LOOKER_URL",
} as const;

type Source = keyof typeof SOURCES;

function isFramingBlocked(headers: Headers): boolean {
  const xfo = headers.get("x-frame-options")?.toLowerCase();
  if (xfo === "deny" || xfo === "sameorigin") return true;

  const csp = headers.get("content-security-policy");
  if (csp) {
    const match = csp.match(/frame-ancestors\s+([^;]+)/i);
    if (match) {
      const sources = match[1].trim();
      if (sources === "'none'") return true;
      if (sources === "'self'") return true;
    }
  }

  return false;
}

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source") as Source | null;
  if (!source || !(source in SOURCES)) {
    return NextResponse.json({ error: "Unknown source" }, { status: 400 });
  }

  const url = process.env[SOURCES[source]];
  if (!url) {
    return NextResponse.json({ embeddable: false, reason: "not_configured" });
  }

  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ embeddable: false, reason: "fetch_failed" });
    }
    return NextResponse.json({ embeddable: !isFramingBlocked(res.headers) });
  } catch {
    return NextResponse.json({ embeddable: false, reason: "fetch_failed" });
  }
}
