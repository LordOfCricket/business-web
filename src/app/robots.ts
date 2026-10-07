import type { MetadataRoute } from "next";

/** The business portal is private — keep it out of search engines. */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
