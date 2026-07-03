import { NextRequest, NextResponse } from "next/server";
import { addCustomer, getCustomers } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ entries: await getCustomers() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, type, email, phone, location, notes } = body;
  if (!name || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }
  const customer = await addCustomer({
    name,
    type,
    email: email ?? "",
    phone: phone ?? "",
    location: location ?? "",
    notes: notes ?? "",
  });
  return NextResponse.json({ customer }, { status: 201 });
}
