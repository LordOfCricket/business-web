"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { ClubIcon } from "@/components/landing/LandingIcons";

interface Props {
  orgId: string;
  name?: string;
}

const CLUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "teams", label: "Teams & Squads" },
  { id: "players", label: "Player Roster (36)" },
  { id: "fixtures", label: "Fixtures & Results" },
  { id: "sponsors", label: "Sponsors & Partners" },
  { id: "trophies", label: "Championship Trophy Cabinet" },
];

export function ClubWorkspace({ orgId, name = "Royal Warriors Cricket Club" }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-900">
            <ClubIcon className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker text-[11px] text-brand-700">SPORTS CLUB WORKSPACE</span>
              <Badge tone="success">Division 1 Club</Badge>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{name}</h1>
            <p className="text-xs text-muted">First XI Squad · Under-19 Development · 8 Trophy Honors</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/workspace"
            className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted hover:border-ink/30 hover:text-ink"
          >
            Switch Workspace
          </Link>
          <Button size="sm">+ Add Contracted Player</Button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-line pb-1 gap-1">
        {CLUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-lg transition ${
              activeTab === tab.id ? "bg-brand-900 text-paper" : "text-muted hover:bg-canvas"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs font-medium text-muted">Contracted Squad Players</p>
              <p className="mt-2 text-3xl font-bold text-ink">36</p>
              <p className="text-xs text-muted mt-1">First XI, Reserves, Under-19</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Next League Fixture</p>
              <p className="mt-2 text-xl font-bold text-ink">vs City Knights</p>
              <p className="text-xs text-amber-700 mt-1">Sun Nov 02, 09:00 AM (Ground A)</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Trophy Honors</p>
              <p className="mt-2 text-3xl font-bold text-ink">8 Titles</p>
              <p className="text-xs text-brand-700 mt-1">2 State Championships</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-base font-semibold text-ink">Active Teams &amp; Squads</h3>
            <div className="grid gap-3 sm:grid-cols-3 mt-4 text-xs">
              <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                <Badge tone="success">Senior Division 1</Badge>
                <h4 className="font-semibold text-ink text-sm mt-2">First XI Squad</h4>
                <p className="text-muted mt-1">Captain: Rohit Kulkarni · 16 Players</p>
              </div>
              <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                <Badge tone="neutral">Youth Academy</Badge>
                <h4 className="font-semibold text-ink text-sm mt-2">Under-19 Development XI</h4>
                <p className="text-muted mt-1">Head Coach: Ramesh Naik · 14 Players</p>
              </div>
              <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                <Badge tone="neutral">Veterans</Badge>
                <h4 className="font-semibold text-ink text-sm mt-2">Veterans Invitational XI</h4>
                <p className="text-muted mt-1">Captain: Sunil Joshi · 12 Players</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "sponsors" && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Club Sponsors &amp; Commercial Partners</h3>
            <Button size="sm">+ Add Sponsor</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 mt-4 text-xs">
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <span className="font-bold text-ink">Apex Nutrition India</span>
              <p className="text-muted mt-1">Official Kit &amp; Nutrition Partner (2025-2027)</p>
            </div>
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <span className="font-bold text-ink">Velocity Sports Tech</span>
              <p className="text-muted mt-1">Official Video Analytics &amp; Wearables Partner</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
