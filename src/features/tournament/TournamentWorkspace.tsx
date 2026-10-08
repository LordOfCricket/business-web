"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { TournamentIcon, CheckmarkIcon } from "@/components/landing/LandingIcons";

interface Props {
  orgId: string;
  name?: string;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "tournaments", label: "All Tournaments" },
  { id: "teams", label: "Teams & Squads (32)" },
  { id: "fixtures", label: "Fixtures & Draws" },
  { id: "officials", label: "Assigned Match Officials" },
  { id: "scoring", label: "Live Scoring Console" },
  { id: "certificates", label: "Certificates & Awards" },
];

export function TournamentWorkspace({ orgId, name = "LordOfSportz Tournament Desk" }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-900">
            <TournamentIcon className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker text-[11px] text-brand-700">TOURNAMENT OPERATIONS</span>
              <Badge tone="success">Competition Desk</Badge>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{name}</h1>
            <p className="text-xs text-muted">
              Leagues · Cups · Knockout Brackets · Live Ball-by-Ball Scoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/workspace"
            className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted hover:border-ink/30 hover:text-ink"
          >
            Switch Workspace
          </Link>
          <Button size="sm">+ Create New Tournament</Button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-line pb-1 gap-1">
        {TABS.map((tab) => (
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
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <p className="text-xs font-medium text-muted">Registered Teams</p>
              <p className="mt-2 text-3xl font-bold text-ink">32 Squads</p>
              <p className="text-xs text-brand-700 mt-1">100% Slot Full</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Total Fixtures</p>
              <p className="mt-2 text-3xl font-bold text-ink">64 Matches</p>
              <p className="text-xs text-muted mt-1">28 Completed, 36 Remaining</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Active Match Officials</p>
              <p className="mt-2 text-3xl font-bold text-ink">8 Certified</p>
              <p className="text-xs text-brand-700 mt-1">Umpires &amp; Scorers Assigned</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Prize Pool</p>
              <p className="mt-2 text-3xl font-bold text-ink">₹2,50,000</p>
              <p className="text-xs text-brand-700 mt-1">Trophy &amp; Medals</p>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <span className="kicker text-[11px] text-brand-700">FEATURED LIVE COMPETITION</span>
                <h3 className="mt-1 text-lg font-semibold text-ink">
                  LordOfSportz Champions Trophy 2026 (T20 League Stage)
                </h3>
                <p className="text-xs text-muted mt-1">
                  Ground A &amp; Ground B · Official Ball: Kookaburra White Turf
                </p>
              </div>
              <Link href="/scoring">
                <Button size="sm">Open Live Scoring Console →</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "fixtures" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Tournament Fixtures &amp; Schedule</h3>
            <Button size="sm">+ Generate Automated Draws</Button>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas text-muted">
                <tr>
                  <th className="p-3">Match #</th>
                  <th className="p-3">Fixture</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Pitch / Venue</th>
                  <th className="p-3">Lead Official</th>
                  <th className="p-3">Score &amp; Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {[
                  { match: "M-29", teams: "Royal Warriors vs Apex Knights", stage: "Quarterfinal 1", time: "Sun 09:00 AM", pitch: "LOS Arena Ground A", official: "Suresh Menon", status: "Upcoming" },
                  { match: "M-30", teams: "City Tigers vs Coastal XI", stage: "Quarterfinal 2", time: "Sun 01:30 PM", pitch: "LOS Arena Ground A", official: "Rajesh Rao", status: "Upcoming" },
                  { match: "M-31", teams: "Metro Stars vs United XI", stage: "Quarterfinal 3", time: "Mon 09:00 AM", pitch: "LOS Arena Ground B", official: "Suresh Menon", status: "Upcoming" },
                ].map((row) => (
                  <tr key={row.match}>
                    <td className="p-3 font-semibold text-ink">{row.match}</td>
                    <td className="p-3 font-medium text-ink">{row.teams}</td>
                    <td className="p-3 text-muted">{row.stage}</td>
                    <td className="p-3 text-muted">{row.time}</td>
                    <td className="p-3 text-muted">{row.pitch}</td>
                    <td className="p-3 text-muted">{row.official}</td>
                    <td className="p-3"><Badge tone="neutral">{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "scoring" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-ink">Live Digital Scoring Consoles</h3>
          <p className="text-xs text-muted">Access official live scoring interfaces for matches currently in progress</p>
          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <h4 className="font-semibold text-ink text-sm">Cricket Ball-by-Ball Console</h4>
              <p className="text-xs text-muted mt-1">Runs, wickets, extras, wagon wheels, over-by-over analysis</p>
              <div className="mt-4">
                <Link href="/scoring">
                  <Button size="sm">Launch Cricket Console</Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <h4 className="font-semibold text-ink text-sm">Karate Kata &amp; Kumite Bout Desk</h4>
              <p className="text-xs text-muted mt-1">WKF electronic match clock, Senshu rules, 7-judge Kata scores</p>
              <div className="mt-4">
                <Link href="/karate/bouts">
                  <Button size="sm">Launch Tatami Console</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
