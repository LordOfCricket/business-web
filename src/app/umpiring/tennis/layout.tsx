import type { ReactNode } from "react";
import { requireLaunched } from "@/lib/sports/launch";

/** Tennis umpiring organiser pages exist only while tennis is launched (LAUNCHED_SPORTS). */
export default function TennisUmpiringLayout({ children }: { children: ReactNode }) {
  requireLaunched("tennis");
  return children;
}
