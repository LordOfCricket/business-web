import type { ReactNode } from "react";
import { requireLaunched } from "@/lib/sports/launch";

/** Football organiser pages exist only while football is launched (LAUNCHED_SPORTS). */
export default function FootballOrganiserLayout({ children }: { children: ReactNode }) {
  requireLaunched("football");
  return children;
}
