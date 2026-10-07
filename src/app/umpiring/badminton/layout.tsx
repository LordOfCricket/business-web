import type { ReactNode } from "react";
import { requireLaunched } from "@/lib/sports/launch";

/** Badminton umpiring organiser pages exist only while badminton is launched (LAUNCHED_SPORTS). */
export default function BadmintonUmpiringLayout({ children }: { children: ReactNode }) {
  requireLaunched("badminton");
  return children;
}
