import "server-only";
import { headers as nextHeaders } from "next/headers";
import { clientContextFrom } from "@/lib/api/client-context";
import { gatewayAuthHeaders } from "@/lib/api/gateway-auth";
import { serverEnv } from "@/lib/env";
import type { ApiErrorBody, ApiResponse } from "@/types/api";

/** Thrown for any non-success envelope; carries the backend error code and request id. */
export class GatewayError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody,
  ) {
    super(body.message);
    this.name = "GatewayError";
  }
}

export interface GatewayRequest {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
  idempotencyKey?: string;
  /** Next.js data cache: seconds to revalidate public GETs (SEO pages); omit for private data. */
  revalidate?: number;
  timeoutMs?: number;
}

/**
 * Server-side call to the API gateway — the only backend the frontend ever talks to.
 * `path` is relative to /api/v1, e.g. "/sports".
 */
export async function gatewayFetch<T>(
  path: string,
  options: GatewayRequest = {},
): Promise<{ data: T; meta?: unknown }> {
  const { method = "GET", body, accessToken, idempotencyKey, revalidate, timeoutMs = 10_000 } = options;
  const personalized = Boolean(accessToken) || method !== "GET";
  // Personalized calls carry the browser context; cached public GETs must not (they are shared by everyone).
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(personalized ? clientContextFrom(await nextHeaders()) : {}),
    ...(await gatewayAuthHeaders()),
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const response = await fetch(`${serverEnv().GATEWAY_URL}/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
    ...(personalized ? { cache: "no-store" as const } : { next: { revalidate: revalidate ?? 60 } }),
  });

  const text = await response.text();
  if (response.ok && text.length === 0) {
    // 202/204: success without a body
    return { data: undefined as T };
  }
  let envelope: ApiResponse<T> | null = null;
  try {
    envelope = JSON.parse(text) as ApiResponse<T>;
  } catch {
    envelope = null;
  }
  if (!envelope) {
    throw new GatewayError(response.status, {
      code: "BAD_GATEWAY_RESPONSE",
      message: "Unexpected response.",
    });
  }
  if (!envelope.success) {
    throw new GatewayError(response.status, envelope.error);
  }
  return { data: envelope.data, meta: envelope.meta };
}
