"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckmarkIcon, SparklesIcon } from "./LandingIcons";

interface SportFeature {
  id: string;
  name: string;
  disciplines: string[];
  operationalHighlights: Array<{ title: string; desc: string }>;
  rolesAvailable: string[];
  equipmentIncluded: string[];
}

const SPORTS: SportFeature[] = [
  {
    id: "cricket",
    name: "Cricket",
    disciplines: ["Red Leather Ball", "White Ball T20 / ODI", "Tennis Ball Turf", "Box Cricket"],
    operationalHighlights: [
      {
        title: "Pitch & Ground Specifications",
        desc: "Manage natural clay, turf, and matting pitches with boundary dimensions (60m - 75m), practice nets, and floodlight LUX levels.",
      },
      {
        title: "Squads & Player Rosters",
        desc: "Maintain batting styles, bowling actions, squad rosters, and historical player career statistics linked directly to matches.",
      },
      {
        title: "Ball-by-Ball Live Scoring",
        desc: "Dedicated digital scoring console supporting extras, wagon wheel analysis, DLS revisions, and real-time public match feeds.",
      },
      {
        title: "Certified Umpiring & Scorer Desk",
        desc: "On-field umpires, third umpires, and official scorers with federation licenses and match fee tracking.",
      },
    ],
    rolesAvailable: ["Head Coach", "Batting Consultant", "Fast Bowling Specialist", "BCCI Umpire", "Official Scorer"],
    equipmentIncluded: ["Grade-1 English Willow Bats", "Leather Match Balls", "Batting Pads", "Helmets", "Practice Nets"],
  },
  {
    id: "karate",
    name: "Karate & Martial Arts",
    disciplines: ["Shotokan", "Goju-Ryu", "Wado-Ryu", "Shito-Ryu", "Kyokushin"],
    operationalHighlights: [
      {
        title: "Standardized Kyu-to-Dan Belt Hierarchy",
        desc: "Automated tracking from 9th Kyu (White) up to 3rd Dan (Black) with minimum age and residency tenure rules.",
      },
      {
        title: "Grading Exams & Promotion Passes",
        desc: "Organize belt grading tests, record examiner notes, and issue verified digital promotion certificates.",
      },
      {
        title: "Kata & Kumite Tournament Bouts",
        desc: "Category eligibility by gender, age, weight, and belt rank. Real-time Kumite bout timers and Kata 7-judge scoring boards.",
      },
      {
        title: "Dojo Branch & Mat Operations",
        desc: "Multi-branch dojo management with head instructor designations, tatami floor specs, and uniform guidelines.",
      },
    ],
    rolesAvailable: ["Shihan / Head Instructor", "Sensei", "Kumite Coach", "Kata Specialist", "WKF Certified Judge"],
    equipmentIncluded: ["Heavyweight Kata Gi", "Kumite Uniforms", "Grading Belts", "Chest Guards", "Foot Protectors"],
  },
  {
    id: "football",
    name: "Football",
    disciplines: ["11v11 Full Pitch", "7v7 Turf Arena", "5v5 Futsal / Cage"],
    operationalHighlights: [
      {
        title: "Turf Quality & Court Formats",
        desc: "Configure FIFA-standard astro turf pitches, rubber infill specs, LED floodlights, and player dugouts.",
      },
      {
        title: "League Fixtures & Points Tables",
        desc: "Automated group stages, knockout brackets, goal difference tiebreakers, and discipline cards (Yellow/Red).",
      },
      {
        title: "Referee Management & Match Sheets",
        desc: "Certified match referees and assistant referees logging goals, substitutions, and disciplinary events.",
      },
      {
        title: "Youth Development Batches",
        desc: "Age-bracketed programs (U-10, U-14, U-17, Senior) with structured tactical drills and attendance tracking.",
      },
    ],
    rolesAvailable: ["Head Coach (AIFF/AFC)", "Goalkeeping Coach", "Strength Trainer", "Main Referee", "Assistant Referee"],
    equipmentIncluded: ["FIFA Certified Match Balls", "Training Cones", "Agility Ladders", "Shin Guards", "Team Bibs"],
  },
  {
    id: "tennis-badminton",
    name: "Tennis & Badminton",
    disciplines: ["Hard Court", "Clay Court", "Grass", "Indoor Wooden Badminton", "Synthetic BWF Mat"],
    operationalHighlights: [
      {
        title: "Court Surface & Lighting Management",
        desc: "Configure court surfaces, indoor climate control, non-marking shoe enforcement, and court maintenance intervals.",
      },
      {
        title: "Singles & Doubles Brackets",
        desc: "Support seeded draws, bye rounds, advantage/tie-break rules, and umpire scoring consoles.",
      },
      {
        title: "Hourly Slot & Racquet Booking",
        desc: "Hourly dynamic court booking engine with optional equipment rental addons (racquets, shuttle tubes, balls).",
      },
      {
        title: "Ranking & Rating Ladders",
        desc: "Maintain club ladder rankings, player handicaps, and monthly internal challenge matches.",
      },
    ],
    rolesAvailable: ["Certified Tennis Pro", "Badminton Head Coach", "Chair Umpire", "Line Judge", "Stringing Specialist"],
    equipmentIncluded: ["Pro Graphite Racquets", "Feather Shuttles", "Championship Tennis Balls", "Grip Tape"],
  },
];

export function SportsEcosystemSection() {
  const [activeSport, setActiveSport] = useState<SportFeature>(SPORTS[0]!);

  return (
    <section aria-labelledby="sports-ecosystem-title" className="py-14 sm:py-20 border-t border-line">
      <div className="flex flex-col items-center text-center">
        <span className="kicker">SPORT-FIRST DOMAIN ARCHITECTURE</span>
        <h2 id="sports-ecosystem-title" className="display mt-2 text-3xl font-normal text-ink sm:text-5xl">
          Deep sports context, everywhere
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Generic business platforms don&apos;t know the difference between a Kumite bout and a cricket boundary.
          LordOfSportz understands the technical rules, equipment, and certifications of every sport.
        </p>

        {/* Sport switcher tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {SPORTS.map((sport) => {
            const active = sport.id === activeSport.id;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => setActiveSport(sport)}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "bg-brand-900 text-paper shadow-sm"
                    : "border border-line bg-surface text-muted hover:border-ink/40 hover:text-ink"
                }`}
              >
                {sport.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Sport Overview */}
      <div className="mt-12 rounded-3xl border border-line bg-surface p-6 sm:p-10 text-left">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-brand-600" />
              <span className="kicker text-[11px] text-brand-700">SPORTS SPECIFICATION MODULE</span>
            </div>
            <h3 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">
              {activeSport.name} Operating Framework
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted">Disciplines Supported:</span>
            {activeSport.disciplines.map((disc) => (
              <span
                key={disc}
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900"
              >
                {disc}
              </span>
            ))}
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {activeSport.operationalHighlights.map((highlight) => (
            <div key={highlight.title} className="rounded-2xl bg-canvas/60 p-5 ring-1 ring-line">
              <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand-600" />
                {highlight.title}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-muted">{highlight.desc}</p>
            </div>
          ))}
        </div>

        {/* Roles & Official Gear */}
        <div className="mt-8 grid gap-6 border-t border-line pt-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-brand-900 uppercase">
              Specialized Professional Roles
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeSport.rolesAvailable.map((role) => (
                <span
                  key={role}
                  className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-muted"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-brand-900 uppercase">
              Official LordOfSportz Equipment
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeSport.equipmentIncluded.map((gear) => (
                <span
                  key={gear}
                  className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-muted"
                >
                  {gear}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href={`/onboarding/business?sport=${activeSport.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline"
          >
            Register a {activeSport.name} entity on LordOfSportz →
          </Link>
        </div>
      </div>
    </section>
  );
}
