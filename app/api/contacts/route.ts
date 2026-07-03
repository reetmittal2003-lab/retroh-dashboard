import { NextRequest, NextResponse } from "next/server";
import { getContactsData } from "@/lib/data";
import { setContactFollowUp } from "@/lib/store";

export async function GET() {
  const data = await getContactsData();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, followUpStatus } = body as { id: string; followUpStatus: string };
  if (!id || !followUpStatus) {
    return NextResponse.json({ error: "id and followUpStatus are required" }, { status: 400 });
  }
  const updated = await setContactFollowUp(id, followUpStatus);
  return NextResponse.json({ override: updated });
}
