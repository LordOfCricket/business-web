import type { Metadata } from "next";
import { OfficialWorkspace } from "@/features/official/OfficialWorkspace";

export const metadata: Metadata = {
  title: "Match Official & Referee Workspace · LordOfSportz Business",
  description: "Official match logs, federation licensing, duty assignments, and scoring sheets.",
};

export default function OfficialWorkspacePage() {
  return <OfficialWorkspace />;
}
