import { NextRequest, NextResponse } from "next/server";
import { getWaitlistData } from "@/lib/data";
import { setWaitlistOverride } from "@/lib/store";

export async function GET() {
  const data = await getWaitlistData();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, source } = body as { id: string; status?: string; source?: string };
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const updated = await setWaitlistOverride(id, { status, source });
  return NextResponse.json({ override: updated });
}
