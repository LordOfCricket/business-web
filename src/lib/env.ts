import "server-only";
import { z } from "zod";

/**
 * Server-side configuration, validated on first use (spec §42). Only NEXT_PUBLIC_* values may ever reach the browser;
 * everything here stays on the server.
 */
const schema = z.object({
  GATEWAY_URL: z.preprocess((v) => (v === "" ? undefined : v), z.url().default("http://localhost:8080")),
  /** Set when the gateway is a private Cloud Run service (NewSports): its URL, the audience of the ID token. */
  GATEWAY_IAM_AUDIENCE: z.preprocess((v) => (v === "" ? undefined : v), z.url().optional()),
  NEXT_PUBLIC_SITE_URL: z.preprocess((v) => (v === "" ? undefined : v), z.url().default("http://localhost:3001")),
  /** Customer site, for "view in the shop" links. */
  CUSTOMER_SITE_URL: z.preprocess((v) => (v === "" ? undefined : v), z.url().default("http://localhost:3000")),
  /** Admin site, for staff/admin links. */
  ADMIN_SITE_URL: z.preprocess((v) => (v === "" ? undefined : v), z.url().optional()),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Sports live on the platform, comma separated (see lib/sports/launch.ts). */
  LAUNCHED_SPORTS: z.preprocess((v) => (v === "" ? undefined : v), z.string().default("cricket,karate")),
  /** Shared proxy secret to authenticate client IP forwarding with gateway. */
  FRONTEND_PROXY_KEY: z.preprocess((v) => (v === "" ? undefined : v), z.string().default("local-frontend-proxy-key")),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= schema.parse(process.env);
  return cached;
}

/** Tests only: forget cached env. */
export function resetServerEnvForTests(): void {
  cached = undefined;
}
