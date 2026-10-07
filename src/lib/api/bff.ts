import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { clientContextFrom } from "@/lib/api/client-context";
import { gatewayAuthHeaders } from "@/lib/api/gateway-auth";
import { serverEnv } from "@/lib/env";

import { ACCESS_COOKIE as ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "idempotency-key", "x-request-id"];
const FORWARDED_RESPONSE_HEADERS = ["content-type", "x-request-id", "retry-after", "cache-control"];
const MAX_BODY_BYTES = 1024 * 1024;

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

/**
 * Backend-for-frontend proxy: browser → (same origin, cookie) → Next.js → (Bearer token) → API gateway.
 * - CSRF: mutating requests must come from this site's own origin.
 * - The token is read from the httpOnly cookie and never exposed to client-side JavaScript.
 */
export async function proxyToGateway(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const method = request.method.toUpperCase();

  if (!SAFE_METHODS.has(method)) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(serverEnv().NEXT_PUBLIC_SITE_URL).origin) {
      return errorResponse(403, "FORBIDDEN", "Cross-site request blocked.");
    }
  }

  if (pathSegments.some((s) => s === ".." || s === "." || s.includes("\\"))) {
    return errorResponse(400, "MALFORMED_REQUEST", "Invalid path.");
  }

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const [name, value] of Object.entries(clientContextFrom(request.headers))) headers.set(name, value);
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);
  for (const [name, value] of Object.entries(await gatewayAuthHeaders())) headers.set(name, value);

  let body: ArrayBuffer | undefined;
  if (!SAFE_METHODS.has(method)) {
    body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) {
      return errorResponse(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
    }
  }

  const target = `${serverEnv().GATEWAY_URL}/api/v1/${pathSegments.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const responseHeaders = new Headers();
    for (const name of FORWARDED_RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return errorResponse(503, "UPSTREAM_UNAVAILABLE", "The service is temporarily unavailable.");
  }
}
