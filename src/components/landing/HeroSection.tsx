"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui";
import {
  AcademyIcon,
  VenueIcon,
  CoachIcon,
  TournamentIcon,
  ShopIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckmarkIcon,
} from "./LandingIcons";

interface PreviewTab {
  id: string;
  label: string;
  sport: string;
  badge: string;
  kpis: Array<{ label: string; value: string }>;
  highlight: string;
  details: string[];
}

const PREVIEW_TABS: PreviewTab[] = [
  {
    id: "academy",
    label: "Sports Academy",
    sport: "Karate / Shotokan",
    badge: "Active Dojo Session",
    kpis: [
      { label: "Active Students", value: "248" },
      { label: "Black Belts", value: "32" },
      { label: "Branches", value: "3 Locations" },
      { label: "Upcoming Grading", value: "Nov 15" },
    ],
    highlight: "Batch: Advanced Kumite & Kata (5:30 PM - 7:00 PM)",
    details: [
      "9-tier Kyu-to-Dan progression system",
      "Head Instructor: Shihan Rajiv Sharma (5th Dan)",
      "Automated attendance & grading eligibility tracking",
    ],
  },
  {
    id: "venue",
    label: "Ground & Venue",
    sport: "Cricket & Multi-Sport",
    badge: "92% Weekend Occupancy",
    kpis: [
      { label: "Turf Pitches", value: "3 Grounds" },
      { label: "Practice Nets", value: "6 Automated" },
      { label: "Floodlights", value: "400 Lux LED" },
      { label: "Today's Bookings", value: "14 Slots" },
    ],
    highlight: "Ground A: Corporate T20 League Quarterfinal (Booked 6 PM - 10 PM)",
    details: [
      "Boundary dimensions: 68m all sides, certified pavilion",
      "Dynamic hourly pricing engine with peak surge rules",
      "Instant player reservation via LordOfSportz app",
    ],
  },
  {
    id: "coach",
    label: "Professional Coach",
    sport: "Cricket High-Performance",
    badge: "Certified Professional",
    kpis: [
      { label: "Experience", value: "12+ Years" },
      { label: "Athletes Mentored", value: "850+" },
      { label: "Certification", value: "NIS & Level 3" },
      { label: "Rating", value: "4.96 (180+)" },
    ],
    highlight: "Personalized batting biomechanics & video analysis programs",
    details: [
      "Structured coaching timeline across state academies",
      "Private 1-on-1 & elite squad booking schedules",
      "Integrated student performance milestones",
    ],
  },
  {
    id: "tournament",
    label: "Tournament Ops",
    sport: "Football & Cricket Leagues",
    badge: "Live Bracket",
    kpis: [
      { label: "Registered Teams", value: "32 Squads" },
      { label: "Fixtures", value: "64 Matches" },
      { label: "Match Officials", value: "8 Certified" },
      { label: "Prize Pool", value: "₹2,50,000" },
    ],
    highlight: "Round of 16: City FC vs Royal Strikers (Live 2nd Half)",
    details: [
      "Automated double-elimination and league draws",
      "Real-time ball-by-ball & goal event broadcasting",
      "Digital participation certificates & prize payouts",
    ],
  },
  {
    id: "shop",
    label: "LOS Official Store",
    sport: "Official Equipment & Gear",
    badge: "LordOfSportz Direct",
    kpis: [
      { label: "Catalog Items", value: "450+ Products" },
      { label: "Disciplines", value: "8 Sports" },
      { label: "Authenticity", value: "100% Brand Certified" },
      { label: "Fulfillment", value: "Pan-India 48h" },
    ],
    highlight: "Curated Grade-1 English Willow & Heavyweight Karate Gi",
    details: [
      "Exclusively operated and fulfilled by LordOfSportz",
      "Specialized equipment by sport, age group & skill level",
      "Architecture prepared for future verified merchants",
    ],
  },
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<PreviewTab>(PREVIEW_TABS[0]!);

  return (
    <section aria-labelledby="hero-title" className="relative pt-6 pb-14 sm:pt-10 sm:pb-20">
      {/* Background ambient accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-12 -z-10 flex justify-center overflow-hidden"
      >
        <div className="h-[460px] w-[800px] rounded-full bg-gradient-to-tr from-brand-100/40 via-brand-50/20 to-transparent blur-3xl" />
      </div>

      <div className="flex flex-col items-center text-center">
        {/* Kicker badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-xs backdrop-blur-xs">
          <SparklesIcon className="size-4 text-brand-600" />
          <span className="kicker text-[11px] font-semibold text-brand-900">
            SPORTS-AWARE OPERATING INFRASTRUCTURE
          </span>
          <span className="hidden sm:inline text-xs text-muted">· Built for India & Global Sports</span>
        </div>

        {/* Primary headline */}
        <h1
          id="hero-title"
          className="display mt-6 max-w-4xl text-4xl leading-[1.08] font-normal text-ink sm:text-6xl lg:text-7xl"
        >
          Run your sports business <br className="hidden sm:inline" />
          <span className="italic font-display text-brand-700">in one place.</span>
        </h1>

        {/* Supporting description */}
        <p className="mt-6 max-w-2xl text-base text-muted sm:text-lg sm:leading-relaxed">
          Manage venues, academies, coaches, staff, bookings, tournaments, sports services and your presence
          across the LordOfSportz ecosystem. Everything engineered with deep sport-specific context.
        </p>

        {/* Dual CTA buttons */}
        <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
          <Link
            href="/onboarding/business"
            className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-paper shadow-sm transition hover:bg-brand-900 hover:shadow-md"
          >
            Register your business
          </Link>
          <Link
            href="/onboarding/professional"
            className="inline-flex h-12 items-center justify-center rounded-full border border-ink/20 bg-surface/90 px-6 text-sm font-semibold text-ink shadow-2xs backdrop-blur-xs transition hover:border-ink/50 hover:bg-surface"
          >
            I&apos;m a coach or sports professional
          </Link>
        </div>

        {/* Trust & capability proof points */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CheckmarkIcon className="size-4 text-brand-600" />
            Zero Platform Setup Fee
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon className="size-4 text-brand-600" />
            Federation &amp; License Verified
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckmarkIcon className="size-4 text-brand-600" />
            Cricket, Karate, Football, Tennis &amp; More
          </span>
        </div>
      </div>

      {/* Interactive Live Workspace Console Preview */}
      <div className="mt-14 rounded-3xl border border-line bg-surface p-4 shadow-sm ring-1 ring-ink/5 sm:p-7">
        <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-600 animate-pulse" />
              <span className="kicker text-[11px] text-brand-700">LIVE WORKSPACE ARCHITECTURE</span>
            </div>
            <h2 className="mt-1 text-lg font-semibold text-ink sm:text-xl">
              Specialized Operations Console
            </h2>
          </div>

          {/* Navigation preview pills */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto py-1">
            {PREVIEW_TABS.map((tab) => {
              const active = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-brand-700 text-white shadow-xs"
                      : "bg-canvas text-muted hover:bg-brand-50 hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview content window */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12 text-left">
          {/* Main KPI snapshot */}
          <div className="flex flex-col justify-between rounded-2xl bg-canvas/70 p-5 ring-1 ring-line lg:col-span-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-xl bg-brand-100 p-2 text-brand-900">
                    {activeTab.id === "academy" && <AcademyIcon className="size-5" />}
                    {activeTab.id === "venue" && <VenueIcon className="size-5" />}
                    {activeTab.id === "coach" && <CoachIcon className="size-5" />}
                    {activeTab.id === "tournament" && <TournamentIcon className="size-5" />}
                    {activeTab.id === "shop" && <ShopIcon className="size-5" />}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{activeTab.label} Operations</h3>
                    <p className="text-xs text-muted">{activeTab.sport}</p>
                  </div>
                </div>
                <Badge tone="success" className="text-[11px]">
                  {activeTab.badge}
                </Badge>
              </div>

              {/* KPI cards */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {activeTab.kpis.map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-surface p-3 ring-1 ring-line">
                    <p className="text-[11px] font-medium text-muted">{kpi.label}</p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-ink">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Realtime spotlight */}
              <div className="mt-5 rounded-xl border border-brand-200/80 bg-brand-50/60 p-3.5">
                <p className="text-xs font-medium text-brand-900">
                  <span className="font-semibold text-brand-700">Current Focus:</span> {activeTab.highlight}
                </p>
              </div>
            </div>

            {/* Bottom mini status bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3 text-xs text-muted">
              <span>Synchronized across LordOfSportz Customer &amp; Business Network</span>
              <Link
                href="/workspace"
                className="font-semibold text-brand-700 hover:text-brand-900 hover:underline"
              >
                Launch workspace demo →
              </Link>
            </div>
          </div>

          {/* Key capability checklist */}
          <div className="flex flex-col justify-between rounded-2xl bg-surface p-5 ring-1 ring-line lg:col-span-4">
            <div>
              <p className="kicker text-[10px] text-muted">SPORT-SPECIFIC ATTRIBUTES</p>
              <h4 className="mt-1 text-sm font-semibold text-ink">Built for this exact sports role</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {activeTab.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2.5 text-xs text-muted">
                    <CheckmarkIcon className="size-4 shrink-0 text-brand-600 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-line">
              <Link
                href={activeTab.id === "coach" ? "/onboarding/professional" : "/onboarding/business"}
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand-50 py-2.5 text-xs font-semibold text-brand-900 hover:bg-brand-100 transition"
              >
                Start as {activeTab.label} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
