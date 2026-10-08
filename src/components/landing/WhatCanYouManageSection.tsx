import Link from "next/link";
import {
  VenueIcon,
  AcademyIcon,
  CoachIcon,
  TournamentIcon,
  ShopIcon,
  UsersGroupIcon,
  BranchesIcon,
  BeltAwardIcon,
  CalendarDaysIcon,
} from "./LandingIcons";

interface ManagementArea {
  title: string;
  kicker: string;
  icon: typeof VenueIcon;
  description: string;
  features: string[];
  link: string;
  linkLabel: string;
}

const AREAS: ManagementArea[] = [
  {
    title: "Grounds & Venues",
    kicker: "FACILITY INFRASTRUCTURE",
    icon: VenueIcon,
    description:
      "Full digital control over natural turf pitches, astro turfs, courts, nets, and pavilion amenities with real-time booking engines.",
    features: [
      "Boundary dimensions & pitch types",
      "Dynamic peak/off-peak hourly pricing",
      "Real-time slot blocks & maintenance rules",
      "Dressing rooms, floodlights & seating",
    ],
    link: "/venues",
    linkLabel: "Manage venues",
  },
  {
    title: "Sports Academies",
    kicker: "TRAINING & STUDENT PROGRESS",
    icon: AcademyIcon,
    description:
      "Deep academy operating system handling students, batches, programs, timetables, and multi-location branch infrastructure.",
    features: [
      "Multi-discipline styles (e.g. Shotokan, Goju-Ryu)",
      "Belt rank & graduation exams",
      "Weekly batch timetables & capacity",
      "Branch-level coach allocations",
    ],
    link: "/workspace",
    linkLabel: "Explore academy suite",
  },
  {
    title: "Coaches & Officials",
    kicker: "SPORT ACCREDITATIONS",
    icon: CoachIcon,
    description:
      "Professional sports profiles with verifiable licenses, structured coaching timeline, match officiating logs, and athlete rosters.",
    features: [
      "Historical academy career timeline",
      "Federation licensing & certifications",
      "1-on-1 private & group session availability",
      "Verified athlete & student reviews",
    ],
    link: "/profile",
    linkLabel: "View professional profile",
  },
  {
    title: "Tournaments & Leagues",
    kicker: "COMPETITION OPERATIONS",
    icon: TournamentIcon,
    description:
      "End-to-end tournament management with bracket draws, participant eligibility, official assignments, and live ball-by-ball scoring.",
    features: [
      "Knockout, round-robin & group draws",
      "Umpire, referee & scorer assignments",
      "Live scoreboards & public broadcast",
      "Digital certificates & trophy records",
    ],
    link: "/tournaments",
    linkLabel: "Operate tournaments",
  },
  {
    title: "LOS Sports Equipment & Shop",
    kicker: "COMMERCE INFRASTRUCTURE",
    icon: ShopIcon,
    description:
      "Curated sports merchandise, authentic training equipment, apparel, and tournament gear operated directly by LordOfSportz.",
    features: [
      "Sport-first catalog hierarchy",
      "Size, weight, variant & inventory control",
      "Pan-India automated logistics & tracking",
      "Architecture ready for future verified merchants",
    ],
    link: "/shop",
    linkLabel: "Visit LOS shop",
  },
  {
    title: "Staff & Granular Access",
    kicker: "GOVERNANCE & ROLES",
    icon: UsersGroupIcon,
    description:
      "Role-based security ensuring managers, head coaches, ground keepers, and accountants access only their authorized modules.",
    features: [
      "Owner, Manager & Staff permissions",
      "Dedicated scorer & referee interfaces",
      "Branch-level administrative boundaries",
      "Audit logs for all critical changes",
    ],
    link: "/staff",
    linkLabel: "Configure staff roles",
  },
];

export function WhatCanYouManageSection() {
  return (
    <section aria-labelledby="manage-title" className="py-14 sm:py-20 border-t border-line">
      <div className="flex flex-col items-center text-center">
        <span className="kicker">COMPLETE CAPABILITIES</span>
        <h2 id="manage-title" className="display mt-2 text-3xl font-normal text-ink sm:text-5xl">
          What can you manage?
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          No generic spreadsheets or rigid business tools. LordOfSportz gives your sports entity deep,
          customized operational control built specifically for athletic operations.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
        {AREAS.map((area) => {
          const Icon = area.icon;
          return (
            <div
              key={area.title}
              className="group relative flex flex-col justify-between rounded-3xl border border-line bg-surface p-7 transition hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-800 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-6" />
                  </div>
                  <span className="kicker text-[10px] text-muted">{area.kicker}</span>
                </div>

                <h3 className="mt-5 text-xl font-semibold text-ink">{area.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{area.description}</p>

                <ul className="mt-5 flex flex-col gap-2 border-t border-line/60 pt-4">
                  {area.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-muted">
                      <span className="size-1.5 rounded-full bg-brand-600" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60">
                <Link
                  href={area.link}
                  className="inline-flex items-center text-xs font-semibold text-brand-700 transition group-hover:text-brand-900 group-hover:underline"
                >
                  {area.linkLabel} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
