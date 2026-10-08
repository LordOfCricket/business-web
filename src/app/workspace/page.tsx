import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/features/workspace/api";
import { WorkspaceGrid } from "@/features/workspace/WorkspaceGrid";
import { SparklesIcon } from "@/components/landing/LandingIcons";

export const metadata: Metadata = {
  title: "Sports Workspaces · LordOfSportz Business",
  description: "Select and manage your sports academies, venues, coaching profiles, match official desks, and shop operations.",
};

export default async function WorkspaceHubPage() {
  const session = await getSession();
  const workspaces = await getUserWorkspaces(session);

  const displayName = session?.user.email
    ? session.user.email.split("@")[0]
    : "Sports Partner";

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Workspace Header */}
      <div className="flex flex-col gap-3 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-900">
            <SparklesIcon className="size-3.5" />
            <span className="font-semibold tracking-wider uppercase">BUSINESS WORKSPACE HUB</span>
          </div>
          <h1 className="display mt-3 text-3xl font-normal text-ink sm:text-5xl">
            Welcome back, <span className="capitalize">{displayName}</span>
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            What would you like to manage today? Select your operational workspace below.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2 text-xs text-muted">
          <span className="size-2 rounded-full bg-brand-600" />
          <span>Ecosystem Active · {workspaces.length} Managed Workspaces</span>
        </div>
      </div>

      {/* Main Grid & Switcher */}
      <WorkspaceGrid workspaces={workspaces} />
    </div>
  );
}
