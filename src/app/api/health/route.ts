import { NextResponse } from "next/server";

/** Liveness/readiness probe for Cloud Run. */
export function GET() {
  return NextResponse.json({ status: "UP" });
}
