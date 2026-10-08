"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkspaceCard } from "./WorkspaceCard";
import type { WorkspaceSummary, WorkspaceKind } from "./types";
import {
  AcademyIcon,
  VenueIcon,
  CoachIcon,
  OfficialIcon,
  SportsCenterIcon,
  TournamentIcon,
} from "@/components/landing/LandingIcons";

const FILTER_TABS: Array<{ id: string; label: string; kind?: WorkspaceKind }> = [
  { id: "all", label: "All Workspaces" },
  { id: "academy", label: "Academies", kind: "ACADEMY" },
  { id: "venue", label: "Venues & Pitches", kind: "VENUE" },
  { id: "coach", label: "Coaching", kind: "COACH" },
  { id: "official", label: "Officials & Referees", kind: "OFFICIAL" },
  { id: "tournament", label: "Tournaments", kind: "TOURNAMENT" },
  { id: "shop", label: "LOS Store", kind: "SHOP" },
];

export function WorkspaceGrid({ workspaces }: { workspaces: WorkspaceSummary[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = workspaces.filter((w) => {
    if (activeTab === "all") return true;
    const tab = FILTER_TABS.find((t) => t.id === activeTab);
    return tab?.kind ? w.kind === tab.kind : true;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Category selector tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-brand-900 text-paper shadow-xs"
                    : "bg-surface text-muted border border-line hover:border-ink/40 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-muted">
          Showing {filtered.length} {filtered.length === 1 ? "workspace" : "workspaces"}
        </span>
      </div>

      {/* Grid of Workspaces */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ws) => (
          <WorkspaceCard key={ws.id} workspace={ws} />
        ))}
      </div>

      {/* "What would you like to manage?" Creation Hub */}
      <div className="mt-8 rounded-3xl border border-line bg-gradient-to-b from-surface to-canvas/60 p-6 sm:p-10">
        <div className="text-left">
          <span className="kicker text-[11px] text-brand-700">EXPAND YOUR SPORTS OPERATIONS</span>
          <h3 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
            What else would you like to manage?
          </h3>
          <p className="mt-2 text-xs text-muted max-w-xl">
            Add additional sports entities, ground facilities, or certified professional profiles to your
            LordOfSportz account.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/onboarding/business?type=ACADEMY"
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand-600 hover:shadow-xs"
          >
            <div className="rounded-xl bg-brand-50 p-2 text-brand-800">
              <AcademyIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">New Sports Academy</p>
              <p className="text-[11px] text-muted">Students, coaches &amp; gradings</p>
            </div>
          </Link>

          <Link
            href="/onboarding/business?type=VENUE_OWNER"
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand-600 hover:shadow-xs"
          >
            <div className="rounded-xl bg-brand-50 p-2 text-brand-800">
              <VenueIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">New Ground / Venue</p>
              <p className="text-[11px] text-muted">Pitches, courts &amp; slot calendar</p>
            </div>
          </Link>

          <Link
            href="/onboarding/professional?role=coach"
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand-600 hover:shadow-xs"
          >
            <div className="rounded-xl bg-brand-50 p-2 text-brand-800">
              <CoachIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">New Coach Profile</p>
              <p className="text-[11px] text-muted">Timeline, medals &amp; booking slots</p>
            </div>
          </Link>

          <Link
            href="/onboarding/professional?role=official"
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand-600 hover:shadow-xs"
          >
            <div className="rounded-xl bg-brand-50 p-2 text-brand-800">
              <OfficialIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">New Match Official</p>
              <p className="text-[11px] text-muted">Umpire, referee &amp; scorer duties</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
