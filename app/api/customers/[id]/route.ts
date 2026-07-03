import { NextRequest, NextResponse } from "next/server";
import { deleteCustomer, updateCustomer } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await updateCustomer(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ customer: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteCustomer(id);
  return NextResponse.json({ ok: true });
}
