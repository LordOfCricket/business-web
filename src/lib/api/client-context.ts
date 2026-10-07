/**
 * The gateway sees our Next.js server, not the browser. To keep per-user rate limits and session/audit data
 * accurate, server-side calls forward the browser's IP (X-Client-IP) and User-Agent. The gateway trusts
 * X-Client-IP only together with the shared FRONTEND_PROXY_KEY (never exposed to the browser).
 */
export function clientContextFrom(requestHeaders: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  const userAgent = requestHeaders.get("user-agent");
  if (userAgent) out["User-Agent"] = userAgent.slice(0, 255);
  const key = process.env.FRONTEND_PROXY_KEY;
  const ip = lastForwardedFor(requestHeaders.get("x-forwarded-for"));
  if (key && ip) {
    out["X-Client-IP"] = ip;
    out["X-Frontend-Key"] = key;
  }
  return out;
}

/** Cloud Run's front end appends the caller's address last; earlier entries are client-controlled. */
export function lastForwardedFor(value: string | null): string | undefined {
  if (!value) return undefined;
  const last = value.split(",").at(-1)?.trim();
  return last && /^[0-9a-fA-F:.]{2,45}$/.test(last) ? last : undefined;
}
