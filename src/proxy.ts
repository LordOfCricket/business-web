import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, cookieOptions, REFRESH_COOKIE, type TokenPair } from "@/lib/auth/cookies";
import { decodeAccessToken, isExpiring } from "@/lib/auth/jwt";
import { AUTH_RULES } from "@/constants/auth";
import { clientContextFrom } from "@/lib/api/client-context";
import { gatewayAuthHeaders } from "@/lib/api/gateway-auth";
import { contentSecurityPolicy, newNonce } from "@/lib/security/csp";

/**
 * Runs before every page and BFF request:
 * 1. Silently refreshes an expiring access token using the httpOnly refresh cookie (rotation happens in identity).
 * 2. Redirects to /login when a protected page is opened without a session, or to `forbiddenRedirect` when the
 *    session lacks a required role. This is UX only — the gateway and services enforce authorization.
 */
export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let claims = decodeAccessToken(accessToken);
  let refreshed: TokenPair | null = null;
  let clearCookies = false;

  if (isExpiring(claims) && refreshToken) {
    refreshed = await refresh(refreshToken, request.headers);
    if (refreshed) {
      claims = decodeAccessToken(refreshed.accessToken);
    } else {
      claims = null;
      clearCookies = true;
    }
  }

  // one nonce per request: the only scripts that may run are the ones this response marked
  const nonce = newNonce();
  const csp = contentSecurityPolicy(nonce, process.env.NODE_ENV !== "production");

  const path = request.nextUrl.pathname;
  const rule = AUTH_RULES.find((r) => r.prefixes.some((p) => path === p || path.startsWith(`${p}/`)));
  let response: NextResponse;

  if (rule && (!claims || isExpiring(claims, 0))) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path + request.nextUrl.search);
    response = NextResponse.redirect(login);
  } else if (rule?.roles && claims && !rule.roles.some((r) => claims.roles.includes(r))) {
    response = NextResponse.redirect(new URL(rule.forbiddenRedirect ?? "/", request.url));
  } else if (refreshed) {
    // Make the new token visible to server components rendering this same request.
    const headers = withNonce(request.headers, nonce, csp);
    request.cookies.set(ACCESS_COOKIE, refreshed.accessToken);
    request.cookies.set(REFRESH_COOKIE, refreshed.refreshToken);
    headers.set("cookie", request.cookies.toString());
    response = NextResponse.next({ request: { headers } });
  } else {
    response = NextResponse.next({ request: { headers: withNonce(request.headers, nonce, csp) } });
  }
  response.headers.set("Content-Security-Policy", csp);

  if (refreshed) {
    response.cookies.set(ACCESS_COOKIE, refreshed.accessToken, cookieOptions(refreshed.accessTokenExpiresAt));
    response.cookies.set(
      REFRESH_COOKIE,
      refreshed.refreshToken,
      cookieOptions(refreshed.refreshTokenExpiresAt),
    );
  } else if (clearCookies) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  }
  return response;
}

/**
 * Next.js reads the nonce from the request's own Content-Security-Policy header and stamps it on the scripts it
 * renders, so both headers have to be set on the request, not only on the response.
 */
function withNonce(original: Headers, nonce: string, csp: string): Headers {
  const headers = new Headers(original);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  return headers;
}

async function refresh(refreshToken: string, requestHeaders: Headers): Promise<TokenPair | null> {
  const gateway = process.env.GATEWAY_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${gateway}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...clientContextFrom(requestHeaders),
        ...(await gatewayAuthHeaders()),
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { success: boolean; data?: TokenPair };
    return body.success && body.data ? body.data : null;
  } catch {
    return null;
  }
}

export const config = {
  // Everything except static assets and the health probe
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/health).*)"],
};
