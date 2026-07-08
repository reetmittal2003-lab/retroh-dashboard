import { NextRequest, NextResponse } from "next/server";

type NetlifySubmissionPayload = {
  form_name?: string;
  data?: Record<string, string>;
  payload?: {
    form_name?: string;
    data?: Record<string, string>;
  };
};

function buildMessage(body: NetlifySubmissionPayload): { title: string; message: string } {
  const formName = body.form_name ?? body.payload?.form_name ?? "unknown";
  const data = body.data ?? body.payload?.data ?? {};

  if (formName === "waitlist") {
    return {
      title: "New Waitlist Signup",
      message: data.email ? `${data.email} joined the RETROH waitlist.` : "New waitlist signup.",
    };
  }

  if (formName === "contact") {
    const from = data.name || data.email || "Someone";
    const subject = data.subject ? ` — ${data.subject}` : "";
    return {
      title: "New Contact Message",
      message: `${from}${subject}: ${(data.message ?? "").slice(0, 140)}`,
    };
  }

  return { title: "New Form Submission", message: `Form: ${formName}` };
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.NETLIFY_WEBHOOK_SECRET || secret !== process.env.NETLIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    return NextResponse.json({ error: "NTFY_TOPIC not configured" }, { status: 500 });
  }

  const body = (await req.json()) as NetlifySubmissionPayload;
  const { title, message } = buildMessage(body);

  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: { Title: title, Priority: "default", Tags: "bell" },
      body: message,
    });
  } catch (err) {
    console.error("Failed to relay lead notification to ntfy.sh", err);
  }

  return NextResponse.json({ ok: true });
}
