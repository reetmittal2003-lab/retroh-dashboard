import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REALM = "RETROH Dashboard";

export function proxy(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;

  if (!password) {
    return new Response(
      "DASHBOARD_PASSWORD is not set. Set it in your environment to access this dashboard.",
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
    const suppliedPassword = decoded.slice(decoded.indexOf(":") + 1);
    if (suppliedPassword === password) {
      return NextResponse.next();
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}"` },
  });
}

export const config = {
  // api/notify/* routes authenticate incoming webhooks with their own shared
  // secret (query param), since the caller (Netlify) can't supply Basic Auth.
  matcher: "/((?!_next/static|_next/image|favicon.ico|api/notify/).*)",
};
