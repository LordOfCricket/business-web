import type { ReactNode } from "react";
import { requireLaunched } from "@/lib/sports/launch";

/** Football refereeing organiser pages exist only while football is launched (LAUNCHED_SPORTS). */
export default function FootballRefereeingLayout({ children }: { children: ReactNode }) {
  requireLaunched("football");
  return children;
}
