/* ============================================================================
 * Vercel Edge Middleware — HTTP Basic Auth for /admin/*
 * ----------------------------------------------------------------------------
 * Set ADMIN_USER and ADMIN_PASS in Vercel > Project > Settings > Environment
 * Variables. Until they are set, /admin/* is locked (fails closed).
 * This is server-side protection on top of the tool's own passcode gate.
 * ========================================================================== */
export const config = { matcher: "/admin/:path*" };

export default function middleware(request) {
  const USER = process.env.ADMIN_USER;
  const PASS = process.env.ADMIN_PASS;

  // Fail closed if credentials are not configured yet.
  if (!USER || !PASS) {
    return new Response("Admin access is not configured.", { status: 503 });
  }

  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    let decoded = "";
    try { decoded = atob(encoded); } catch (e) { decoded = ""; }
    const i = decoded.indexOf(":");
    const u = decoded.slice(0, i);
    const p = decoded.slice(i + 1);
    if (i !== -1 && u === USER && p === PASS) {
      return; // authorised — continue to the requested file
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="BBQ Bali Admin", charset="UTF-8"' },
  });
}
