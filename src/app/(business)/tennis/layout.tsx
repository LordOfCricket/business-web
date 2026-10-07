import type { ReactNode } from "react";
import { requireLaunched } from "@/lib/sports/launch";

/** Tennis organiser pages exist only while tennis is launched (LAUNCHED_SPORTS). */
export default function TennisOrganiserLayout({ children }: { children: ReactNode }) {
  requireLaunched("tennis");
  return children;
}
