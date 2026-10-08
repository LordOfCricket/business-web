"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input } from "@/components/ui";
import {
  CoachIcon,
  BeltAwardIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckmarkIcon,
} from "@/components/landing/LandingIcons";
import {
  SAMPLE_COACHING_HISTORY,
  SAMPLE_COACH_ACHIEVEMENTS,
  SAMPLE_NOTABLE_ATHLETES,
  SAMPLE_COACH_OFFERINGS,
  SAMPLE_COACH_QUALIFICATIONS,
} from "./mockData";
import type { CoachingHistoryEntry, StructuredCoachAchievement } from "./types";

const COACH_TABS = [
  { id: "overview", label: "Overview" },
  { id: "identity", label: "Identity & Bio" },
  { id: "sports", label: "Sports & Specializations" },
  { id: "history", label: "Coaching History (3)" },
  { id: "achievements", label: "Achievements (3)" },
  { id: "qualifications", label: "Licenses & Qualifications" },
  { id: "offerings", label: "Services & Pricing" },
  { id: "athletes", label: "Notable Athletes" },
  { id: "availability", label: "Working Availability" },
  { id: "reviews", label: "Reviews & Ratings" },
];

export function CoachWorkspace() {
  const [activeTab, setActiveTab] = useState("overview");
  const [historyList, setHistoryList] = useState<CoachingHistoryEntry[]>(SAMPLE_COACHING_HISTORY);
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<CoachingHistoryEntry>>({
    academy: "",
    position: "",
    sport: "Karate",
    discipline: "Shotokan",
    startYear: "2024",
    endYear: "Present",
    responsibilities: "",
    achievements: "",
  });

  const handleAddHistory = () => {
    if (!newEntry.academy || !newEntry.position) return;
    const entry: CoachingHistoryEntry = {
      id: `hist-${Date.now()}`,
      academy: newEntry.academy,
      position: newEntry.position,
      sport: newEntry.sport || "Karate",
      discipline: newEntry.discipline || "Shotokan",
      startYear: newEntry.startYear || "2024",
      endYear: newEntry.endYear || "Present",
      isCurrent: newEntry.endYear === "Present",
      responsibilities: newEntry.responsibilities || "",
      achievements: newEntry.achievements || "",
    };
    setHistoryList([entry, ...historyList]);
    setShowAddHistory(false);
    setNewEntry({ academy: "", position: "" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Coach Header Profile Banner */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-900">
            <CoachIcon className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="kicker text-[11px] text-brand-700">COACHING WORKSPACE</span>
              <Badge tone="success">Verified Pro Coach</Badge>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">Rahul Sharma</h1>
            <p className="text-xs text-muted">
              Head Coach · Karate &amp; Martial Arts · 12+ Years Experience · Mumbai, India
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/workspace"
            className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted hover:border-ink/30 hover:text-ink"
          >
            Switch Workspace
          </Link>
          <Button size="sm">
            View Public Profile
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto border-b border-line pb-1 gap-1">
        {COACH_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-2 text-xs font-semibold whitespace-nowrap transition rounded-lg ${
                active
                  ? "bg-brand-900 text-paper shadow-2xs"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs font-medium text-muted">Total Experience</p>
              <p className="mt-2 text-3xl font-bold text-ink">12+ Years</p>
              <p className="mt-1 text-xs text-brand-700">Coaching since 2014</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Athletes Mentored</p>
              <p className="mt-2 text-3xl font-bold text-ink">850+</p>
              <p className="mt-1 text-xs text-muted">Across 3 Academies</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Verified Honors</p>
              <p className="mt-2 text-3xl font-bold text-ink">3 Medals</p>
              <p className="mt-1 text-xs text-amber-700">1 International, 2 National</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-muted">Rating</p>
              <p className="mt-2 text-3xl font-bold text-ink">4.96 ★</p>
              <p className="mt-1 text-xs text-brand-700">180+ Athlete Reviews</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex flex-col justify-between">
              <div>
                <span className="kicker text-[11px] text-brand-700">CURRENT APPOINTMENT</span>
                <h3 className="mt-2 text-lg font-semibold text-ink">
                  LordOfSportz Martial Arts Academy
                </h3>
                <p className="text-xs text-muted">Head Coach &amp; Technical Director · Since 2023</p>
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  Oversees advanced Kumite sparring and national competition cadet preparation.
                  Coordinates branch curriculum across Mumbai and Thane centers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-line flex justify-end">
                <Button size="sm" variant="secondary" onClick={() => setActiveTab("history")}>
                  Manage Coaching History →
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <span className="kicker text-[11px] text-brand-700">UPCOMING PRIVATE SESSIONS</span>
                <h3 className="mt-2 text-lg font-semibold text-ink">
                  4 Athlete Slots Booked This Week
                </h3>
                <p className="text-xs text-muted">1-on-1 Biomechanics &amp; Kumite Tactics</p>
                <div className="mt-3 flex flex-col gap-2 text-xs">
                  <div className="rounded-xl bg-canvas p-2.5 flex items-center justify-between ring-1 ring-line">
                    <span>Aarav Mehta · Saturday 05:00 PM</span>
                    <Badge tone="success">Confirmed</Badge>
                  </div>
                  <div className="rounded-xl bg-canvas p-2.5 flex items-center justify-between ring-1 ring-line">
                    <span>Ananya Iyer · Sunday 09:30 AM</span>
                    <Badge tone="success">Confirmed</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-line flex justify-end">
                <Button size="sm" variant="secondary" onClick={() => setActiveTab("availability")}>
                  Adjust Weekly Availability →
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Coaching History (Structured Entries) */}
      {activeTab === "history" && (
        <Card className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Structured Coaching Career Timeline</h3>
              <p className="text-xs text-muted">
                Structured chronological records of academies, roles, and competitive achievements
              </p>
            </div>
            <Button size="sm" onClick={() => setShowAddHistory(!showAddHistory)}>
              {showAddHistory ? "Cancel" : "+ Add Experience Record"}
            </Button>
          </div>

          {showAddHistory && (
            <div className="rounded-2xl bg-canvas p-5 ring-1 ring-line flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-ink">Add Coaching Career Record</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Academy / Sports Organization"
                  placeholder="e.g. ABC Sports Academy"
                  value={newEntry.academy ?? ""}
                  onChange={(e) => setNewEntry({ ...newEntry, academy: e.target.value })}
                />
                <Input
                  label="Position / Designation"
                  placeholder="e.g. Senior Kumite Coach"
                  value={newEntry.position ?? ""}
                  onChange={(e) => setNewEntry({ ...newEntry, position: e.target.value })}
                />
                <Input
                  label="Sport"
                  placeholder="e.g. Karate"
                  value={newEntry.sport ?? ""}
                  onChange={(e) => setNewEntry({ ...newEntry, sport: e.target.value })}
                />
                <Input
                  label="Discipline / Specialization"
                  placeholder="e.g. Shotokan / Kumite"
                  value={newEntry.discipline ?? ""}
                  onChange={(e) => setNewEntry({ ...newEntry, discipline: e.target.value })}
                />
                <Input
                  label="Start Year"
                  placeholder="e.g. 2021"
                  value={newEntry.startYear ?? ""}
                  onChange={(e) => setNewEntry({ ...newEntry, startYear: e.target.value })}
                />
                <Input
                  label="End Year (or 'Present')"
                  placeholder="e.g. 2024 or Present"
                  value={newEntry.endYear ?? ""}
                  onChange={(e) => setNewEntry({ ...newEntry, endYear: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink">Key Responsibilities &amp; Achievements</label>
                <textarea
                  className="h-20 rounded-xl border border-ink/15 bg-surface p-3 text-xs"
                  placeholder="Describe your training scope, athletes developed, and championships won."
                  value={newEntry.responsibilities ?? ""}
                  onChange={(e) => setNewEntry({ ...newEntry, responsibilities: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" onClick={handleAddHistory}>
                  Save Career Record
                </Button>
              </div>
            </div>
          )}

          {/* Timeline View */}
          <div className="flex flex-col gap-4">
            {historyList.map((hist) => (
              <div
                key={hist.id}
                className="relative rounded-2xl border border-line bg-surface p-5 transition hover:border-brand-600/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-900 text-sm">
                      {hist.startYear} – {hist.endYear}
                    </span>
                    {hist.isCurrent && <Badge tone="success">Current Role</Badge>}
                  </div>
                  <span className="rounded bg-canvas px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                    {hist.sport} / {hist.discipline}
                  </span>
                </div>

                <h4 className="mt-2 text-base font-semibold text-ink">{hist.academy}</h4>
                <p className="text-xs font-medium text-brand-700">{hist.position}</p>
                {hist.branch && <p className="text-xs text-muted">Branch: {hist.branch}</p>}

                <p className="mt-3 text-xs leading-relaxed text-muted">{hist.responsibilities}</p>
                {hist.achievements && (
                  <div className="mt-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-900 border border-brand-200">
                    <strong>Honors:</strong> {hist.achievements}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Structured Achievements */}
      {activeTab === "achievements" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Structured Honors &amp; Awards</h3>
              <p className="text-xs text-muted">
                Official athlete championships and coaching excellence titles
              </p>
            </div>
            <Button size="sm">+ Add Achievement</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-2">
            {SAMPLE_COACH_ACHIEVEMENTS.map((ach) => (
              <div key={ach.id} className="rounded-2xl bg-canvas p-5 ring-1 ring-line flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Badge tone="neutral">{ach.level}</Badge>
                    <span className="text-xs font-bold text-muted">{ach.year}</span>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-ink leading-snug">{ach.title}</h4>
                  <p className="mt-2 text-xs text-muted">{ach.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-line text-[11px] text-brand-800 font-medium">
                  Category: {ach.category} · Role: {ach.role}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Qualifications & Licenses */}
      {activeTab === "qualifications" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Federation Licenses &amp; Accreditations</h3>
              <p className="text-xs text-muted">Verified digital credentials and coaching licenses</p>
            </div>
            <Button size="sm">+ Add License</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-2">
            {SAMPLE_COACH_QUALIFICATIONS.map((qual) => (
              <div key={qual.id} className="rounded-2xl bg-canvas p-5 ring-1 ring-line flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <ShieldCheckIcon className="size-5 text-brand-600" />
                    {qual.verified && <Badge tone="success">Federation Verified</Badge>}
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-ink leading-snug">{qual.name}</h4>
                  <p className="mt-1 text-xs text-muted">Issuer: {qual.issuer}</p>
                  {qual.licenseNumber && (
                    <p className="mt-1 text-xs font-mono text-brand-900">License: {qual.licenseNumber}</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-line text-[11px] text-muted">
                  Year Awarded: {qual.yearAwarded}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Services & Pricing */}
      {activeTab === "offerings" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Coaching Offerings &amp; Services</h3>
              <p className="text-xs text-muted">Private 1-on-1, squad clinics, and group packages</p>
            </div>
            <Button size="sm">+ New Offering</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {SAMPLE_COACH_OFFERINGS.map((off) => (
              <Card key={off.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Badge tone="neutral">{off.type.replace("_", " ")}</Badge>
                    <span className="text-xs font-semibold text-muted">{off.durationMinutes} mins</span>
                  </div>
                  <h4 className="mt-3 text-base font-semibold text-ink">{off.name}</h4>
                  <p className="mt-1 text-xs text-muted">{off.description}</p>
                  <p className="mt-2 text-xs text-muted">Age Bracket: {off.ageGroup}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-lg font-bold text-ink">₹{off.priceAmount}</span>
                  <Button size="sm" variant="secondary">Edit Offering</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Notable Athletes */}
      {activeTab === "athletes" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Notable Athletes &amp; Protégés Coached</h3>
              <p className="text-xs text-muted">Proven player development track record</p>
            </div>
            <Button size="sm">+ Add Athlete</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-2">
            {SAMPLE_NOTABLE_ATHLETES.map((ath) => (
              <div key={ath.id} className="rounded-2xl bg-canvas p-5 ring-1 ring-line">
                <h4 className="text-base font-semibold text-ink">{ath.name}</h4>
                <p className="text-xs text-muted">{ath.sport}</p>
                <div className="mt-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-900 border border-brand-200">
                  <strong>Accolade:</strong> {ath.currentTitle}
                </div>
                <p className="mt-3 text-[11px] text-muted">Coached since {ath.coachedSince}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Working Availability */}
      {activeTab === "availability" && (
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-ink">Working Days &amp; Booking Hours</h3>
          <p className="text-xs text-muted">Define when athletes can book training slots</p>
          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <div key={day} className="flex items-center justify-between rounded-xl bg-canvas p-3 ring-1 ring-line text-xs">
                <span className="font-semibold text-ink">{day}</span>
                <span className="text-muted">06:00 AM - 11:00 AM &amp; 04:30 PM - 08:30 PM</span>
                <Badge tone="success">Available</Badge>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-line">
            <Button>Update Availability</Button>
          </div>
        </Card>
      )}

      {/* Tab: Reviews & Ratings */}
      {activeTab === "reviews" && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Athlete &amp; Academy Reviews</h3>
            <Badge tone="success">4.96 ★ (180+ Reviews)</Badge>
          </div>
          <p className="text-xs text-muted">Verified feedback from competitive athletes and academy managers</p>
          <div className="mt-2 flex flex-col gap-3">
            <div className="rounded-2xl bg-canvas p-4 ring-1 ring-line text-xs">
              <div className="flex justify-between items-center">
                <strong>Priya Nair (National Athlete)</strong>
                <span className="text-amber-600 font-bold">★★★★★</span>
              </div>
              <p className="mt-2 text-muted">
                Shihan Rahul transformed my Kumite speed and tactical countering. His video breakdown before the Commonwealth Championship gave me the edge to win Silver.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
