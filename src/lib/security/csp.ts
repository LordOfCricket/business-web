/**
 * Content-Security-Policy with a per-request nonce (spec §35).
 *
 * The point of the nonce is `script-src`: only scripts the server marked with this request's nonce may run, so an
 * injected `<script>` does nothing even if something gets through validation and escaping. `strict-dynamic` lets
 * those trusted scripts load the chunks they need without listing every path.
 *
 * `style-src` keeps `'unsafe-inline'`. Next.js inlines critical CSS and React inlines style attributes, and a
 * nonce cannot cover those; pretending otherwise would mean a policy that is either broken or quietly ignored.
 * Styles are a far smaller risk than scripts, and this is the usual place to draw the line.
 */
export function contentSecurityPolicy(nonce: string, isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    // 'unsafe-eval' only in development, where React Refresh needs it
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    // media comes from object storage over https, and from data: URIs for the tiny inline placeholders
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // the browser only ever talks to this origin: the API is reached through the BFF, never directly
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];
  return directives.join("; ");
}

/**
 * A fresh nonce per request; 128 bits is more than enough for something that lives for one response. Built with
 * btoa rather than Buffer because this runs in the middleware's Edge runtime, where Buffer does not exist.
 */
export function newNonce(): string {
  return btoa(crypto.randomUUID());
}
