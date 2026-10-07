"use server";

import { z } from "zod";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

export interface UploadTicket {
  mediaId: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
}

export interface UploadedMedia {
  id: string;
  kind: string;
  status: string;
  url?: string;
}

const PURPOSES = [
  "AVATAR",
  "PROFESSIONAL_IMAGE",
  "CERTIFICATE",
  "VENUE_IMAGE",
  "VENUE_VIDEO",
  "FACILITY_IMAGE",
  "PRODUCT_IMAGE",
  "ORG_DOCUMENT",
  "SPORT_ICON",
] as const;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

async function token(): Promise<string | null> {
  return (await getSession())?.accessToken ?? null;
}

function error(e: unknown): { ok: false; error: string } {
  return {
    ok: false,
    error: e instanceof GatewayError ? e.body.message : "Upload failed. Please try again.",
  };
}

/** Step 1: ask the media service for a signed upload URL (the file itself never passes through our servers). */
export async function requestUploadAction(input: {
  purpose: string;
  contentType: string;
  sizeBytes: number;
}): Promise<Result<UploadTicket>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: "Please sign in again." };
  const parsed = z
    .object({
      purpose: z.enum(PURPOSES),
      contentType: z.string().max(100),
      sizeBytes: z.number().int().positive(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid file." };
  try {
    const { data } = await gatewayFetch<UploadTicket>("/media/uploads", {
      method: "POST",
      body: parsed.data,
      accessToken,
    });
    return { ok: true, value: data };
  } catch (e) {
    return error(e);
  }
}

/** Step 3: ask the media service to verify the stored file (size + file signature). */
export async function completeUploadAction(mediaId: string): Promise<Result<UploadedMedia>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: "Please sign in again." };
  if (!z.uuid().safeParse(mediaId).success) return { ok: false, error: "Invalid upload." };
  try {
    const { data } = await gatewayFetch<UploadedMedia>(`/media/uploads/${mediaId}/complete`, {
      method: "POST",
      accessToken,
    });
    return { ok: true, value: data };
  } catch (e) {
    return error(e);
  }
}
