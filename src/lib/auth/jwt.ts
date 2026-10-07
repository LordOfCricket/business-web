/**
 * Reads claims from our access token WITHOUT verifying the signature. Used only for UI decisions (show a menu,
 * redirect to login, decide when to refresh). Every API call is verified by the gateway and the services.
 */
export interface AccessClaims {
  sub: string;
  email?: string;
  roles: string[];
  orgs: Array<{ id: string; role: string }>;
  exp: number;
}

export function decodeAccessToken(token: string | undefined): AccessClaims | null {
  if (!token) return null;
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(json) as Partial<AccessClaims>;
    if (typeof claims.sub !== "string" || typeof claims.exp !== "number") return null;
    return {
      sub: claims.sub,
      email: claims.email,
      roles: Array.isArray(claims.roles) ? claims.roles : [],
      orgs: Array.isArray(claims.orgs) ? claims.orgs : [],
      exp: claims.exp,
    };
  } catch {
    return null;
  }
}

/** True if the token is missing or expires within `skewSeconds`. */
export function isExpiring(claims: AccessClaims | null, skewSeconds = 30): boolean {
  return !claims || claims.exp * 1000 - Date.now() < skewSeconds * 1000;
}

/** Only allow same-site relative paths as post-login destinations (prevents open redirects). */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
