import Link from "next/link";
import { Badge } from "@/components/ui";
import {
  AcademyIcon,
  VenueIcon,
  CoachIcon,
  OfficialIcon,
  SportsCenterIcon,
  ClubIcon,
  TournamentIcon,
  ShopIcon,
} from "@/components/landing/LandingIcons";
import type { WorkspaceSummary } from "./types";

const ICONS: Record<string, typeof AcademyIcon> = {
  academy: AcademyIcon,
  venue: VenueIcon,
  coach: CoachIcon,
  official: OfficialIcon,
  sports_center: SportsCenterIcon,
  club: ClubIcon,
  tournament: TournamentIcon,
  shop: ShopIcon,
};

export function WorkspaceCard({ workspace }: { workspace: WorkspaceSummary }) {
  const Icon = ICONS[workspace.iconName] ?? AcademyIcon;

  return (
    <div className="group flex flex-col justify-between rounded-3xl border border-line bg-surface p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-600/40 hover:shadow-lg">
      <div>
        {/* Top header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-800 transition group-hover:bg-brand-600 group-hover:text-white">
              <Icon className="size-6" />
            </div>
            <div>
              <span className="kicker text-[10px] text-muted">{workspace.kind.replace("_", " ")}</span>
              <h3 className="text-base font-semibold text-ink leading-tight">{workspace.title}</h3>
            </div>
          </div>
          <Badge tone={workspace.status === "ACTIVE" || workspace.status === "VERIFIED" ? "success" : "neutral"}>
            {workspace.status}
          </Badge>
        </div>

        {/* Tagline / Sport subtitle */}
        <p className="mt-3 text-xs leading-relaxed text-muted">{workspace.tagline}</p>

        {/* Sport disciplines badges */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-900">
            {workspace.sport}
          </span>
          {workspace.sportDisciplines?.slice(0, 2).map((disc) => (
            <span
              key={disc}
              className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted"
            >
              {disc}
            </span>
          ))}
        </div>

        {/* Operational KPI summary */}
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line/70 pt-4">
          {workspace.metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-canvas/70 p-2.5 ring-1 ring-line/50">
              <p className="text-[10px] font-medium text-muted">{m.label}</p>
              <p className="mt-0.5 text-sm font-bold text-ink">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action link */}
      <div className="mt-6 pt-4 border-t border-line/70">
        <Link
          href={workspace.href}
          className="inline-flex w-full items-center justify-center rounded-xl bg-ink py-2.5 text-xs font-semibold text-paper transition hover:bg-brand-900 group-hover:bg-brand-800"
        >
          Open Workspace →
        </Link>
      </div>
    </div>
  );
}
