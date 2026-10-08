import type { Metadata } from "next";
import { CoachWorkspace } from "@/features/coach/CoachWorkspace";

export const metadata: Metadata = {
  title: "Coach Professional Workspace · LordOfSportz Business",
  description: "Manage your coaching career history, structured achievements, licensing, athletes, and booking availability.",
};

export default function CoachWorkspacePage() {
  return <CoachWorkspace />;
}
