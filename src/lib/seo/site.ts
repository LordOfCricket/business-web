import type { Metadata } from "next";
import { APP } from "@/constants/app";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
}

/** Base metadata: title template, canonical base, Open Graph and Twitter cards (spec §29). */
export function baseMetadata(): Metadata {
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${APP.name} — ${APP.tagline}`, template: `%s | ${APP.name}` },
    description: APP.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: APP.name,
      title: APP.name,
      description: APP.description,
      url: "/",
    },
    twitter: { card: "summary_large_image", title: APP.name, description: APP.description },
    robots: { index: false, follow: false }, // private portal
  };
}
