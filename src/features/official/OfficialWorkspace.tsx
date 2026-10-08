"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { OfficialIcon, ShieldCheckIcon } from "@/components/landing/LandingIcons";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "sports", label: "Sport Officiating Roles" },
  { id: "licenses", label: "Federation Accreditations" },
  { id: "matches", label: "Officiated Match History (240+)" },
  { id: "availability", label: "Match Day Availability" },
  { id: "reports", label: "Disciplinary Reports" },
];

export function OfficialWorkspace() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-900">
            <OfficialIcon className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker text-[11px] text-brand-700">MATCH OFFICIAL DESK</span>
              <Badge tone="success">Duty Ready</Badge>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">Suresh Menon</h1>
            <p className="text-xs text-muted">
              Senior Umpire &amp; Official Match Scorer · Cricket &amp; Football · BCCI Panel #9482
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
          <Button size="sm">Download Match Roster</Button>
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
              <p className="text-xs font-medium text-muted">Matches Officiated</p>
              <p className="mt-2 text-3xl font-bold text-ink">240+</p>
              <p className="text-xs text-brand-700 mt-1">State &amp; Corporate Leagues</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Tournaments Handled</p>
              <p className="mt-2 text-3xl font-bold text-ink">38</p>
              <p className="text-xs text-muted mt-1">Chief Match Referee</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Federation License</p>
              <p className="mt-2 text-xl font-bold font-mono text-ink">BCCI #9482</p>
              <p className="text-xs text-brand-700 mt-1">Active Level 2 Panel</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Official Rating</p>
              <p className="mt-2 text-3xl font-bold text-ink">4.98 ★</p>
              <p className="text-xs text-brand-700 mt-1">100% Decision Accuracy Record</p>
            </Card>
          </div>

          <Card>
            <span className="kicker text-[11px] text-brand-700">NEXT MATCH ASSIGNMENT</span>
            <h3 className="mt-2 text-lg font-semibold text-ink">
              T20 Championship Quarterfinal · Mumbai Corporate Trophy
            </h3>
            <p className="text-xs text-muted mt-1">
              Role: On-field Senior Umpire · Ground A (LOS Sports Arena) · Sun Nov 02, 09:00 AM
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm">Open Digital Match Sheet</Button>
              <Button size="sm" variant="secondary">Contact Tournament Desk</Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "sports" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-ink">Sport-Specific Officiating Accreditations</h3>
          <p className="text-xs text-muted">Specialized roles configured with sport rulebooks</p>

          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <Badge tone="success">Cricket</Badge>
              <h4 className="mt-2 font-semibold text-ink text-sm">BCCI Certified Umpire &amp; Official Scorer</h4>
              <ul className="mt-3 flex flex-col gap-1 text-xs text-muted">
                <li>• On-Field Lead Umpire (T20, One-Day &amp; Multi-Day)</li>
                <li>• Third Umpire &amp; DRS Coordinator</li>
                <li>• Official Digital Ball-by-Ball Match Scorer</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
              <Badge tone="neutral">Football</Badge>
              <h4 className="mt-2 font-semibold text-ink text-sm">AIFF Certified Referee (Category 4)</h4>
              <ul className="mt-3 flex flex-col gap-1 text-xs text-muted">
                <li>• Main Match Referee (11v11 State Leagues)</li>
                <li>• Assistant Referee (Touchline &amp; Offside)</li>
                <li>• Fourth Official &amp; Disciplinary Logging</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "matches" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-ink">Recent Officiated Matches</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas text-muted">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Tournament / Fixture</th>
                  <th className="p-3">Sport &amp; Role</th>
                  <th className="p-3">Venue</th>
                  <th className="p-3">Match Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {[
                  { date: "Oct 04, 2026", fixture: "City Knights vs Royal Strikers", sport: "Cricket · Lead Umpire", venue: "LOS Arena Ground A", status: "Clean Sheet" },
                  { date: "Sep 28, 2026", fixture: "Apex FC vs United Warriors", sport: "Football · Main Referee", venue: "Western Turf 7v7", status: "1 Yellow Card" },
                  { date: "Sep 15, 2026", fixture: "Corporate T20 League Stage", sport: "Cricket · Official Scorer", venue: "LOS Arena Ground B", status: "DLS Revised" },
                ].map((m) => (
                  <tr key={m.fixture}>
                    <td className="p-3 font-semibold text-ink">{m.date}</td>
                    <td className="p-3 font-medium text-ink">{m.fixture}</td>
                    <td className="p-3 text-muted">{m.sport}</td>
                    <td className="p-3 text-muted">{m.venue}</td>
                    <td className="p-3"><Badge tone="success">{m.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
