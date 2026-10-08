import Link from "next/link";
import { CoachIcon, OfficialIcon, CheckmarkIcon, ShieldCheckIcon } from "./LandingIcons";

interface ProfessionalRoleBlock {
  title: string;
  badge: string;
  icon: typeof CoachIcon;
  description: string;
  sportsSpecializations: string[];
  capabilities: string[];
  ctaLabel: string;
  ctaHref: string;
}

const ROLES: ProfessionalRoleBlock[] = [
  {
    title: "For Coaches & Performance Trainers",
    badge: "Head Coaches · Specialists · Mentors",
    icon: CoachIcon,
    description:
      "Showcase your lifetime athletic career, verified NIS / federation coaching licenses, student achievements, and structured employment history.",
    sportsSpecializations: [
      "Cricket Batting & Bowling Coaches",
      "Karate Sensei & Kumite Instructors",
      "Football UEFA / AIFF Licensed Coaches",
      "Tennis Pro Coaches & Conditioning Specialists",
    ],
    capabilities: [
      "Chronological multi-academy coaching history",
      "Verified national & international championship medals",
      "1-on-1 private training & group batch booking schedules",
      "Notable athlete & protégé mentorship roster",
      "Public SEO-optimized profile with verified reviews",
    ],
    ctaLabel: "Build your Coach Profile",
    ctaHref: "/onboarding/professional?role=coach",
  },
  {
    title: "For Match Officials, Referees & Umpires",
    badge: "BCCI · AIFF · WKF · BWF Match Officials",
    icon: OfficialIcon,
    description:
      "A dedicated officiating console to record federation badges, licensing numbers, match duty logs, disciplinary actions, and assignment availability.",
    sportsSpecializations: [
      "Cricket Umpires (On-field & Third Umpire)",
      "Official Cricket & Ball-by-Ball Scorers",
      "Football Referees & Assistant Referees",
      "Karate Tatami Referees & Corner Judges",
    ],
    capabilities: [
      "Federation license number & certification badges",
      "Match duty timeline & officiated tournament portfolio",
      "Tournament match day assignment availability",
      "Direct match fee settlement & digital payment tracking",
      "Disciplinary log sheets & match commissioner reports",
    ],
    ctaLabel: "Register as Match Official",
    ctaHref: "/onboarding/professional?role=official",
  },
];

export function ForProfessionalsSection() {
  return (
    <section aria-labelledby="professionals-title" className="py-14 sm:py-20 border-t border-line">
      <div className="flex flex-col items-center text-center">
        <span className="kicker">DEDICATED PROFESSIONAL INFRASTRUCTURE</span>
        <h2 id="professionals-title" className="display mt-2 text-3xl font-normal text-ink sm:text-5xl">
          Built for sports professionals
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Whether you coach future champions or uphold the rules on match day, LordOfSportz provides a
          serious, verifiable home for your sports career.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2 text-left">
        {ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <div
              key={role.title}
              className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-7 sm:p-9 transition hover:border-brand-600/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-800">
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full bg-canvas px-3 py-1 text-[11px] font-semibold text-muted">
                    {role.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-semibold text-ink">{role.title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-muted">{role.description}</p>

                {/* Sports disciplines covered */}
                <div className="mt-5 border-t border-line/70 pt-4">
                  <p className="text-[11px] font-semibold tracking-wider text-brand-900 uppercase">
                    Disciplines &amp; Specializations:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {role.sportsSpecializations.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-lg bg-canvas px-2.5 py-1 text-[11px] font-medium text-muted"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capabilities list */}
                <div className="mt-5 border-t border-line/70 pt-4">
                  <p className="text-[11px] font-semibold tracking-wider text-brand-900 uppercase">
                    Key Profile Capabilities:
                  </p>
                  <ul className="mt-2.5 flex flex-col gap-2">
                    {role.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2 text-xs text-muted">
                        <CheckmarkIcon className="size-3.5 shrink-0 text-brand-600 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-line/70 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <ShieldCheckIcon className="size-4 text-brand-600" />
                  Includes Public Verified SEO Profile
                </span>
                <Link
                  href={role.ctaHref}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-xs font-semibold text-paper hover:bg-brand-900 transition"
                >
                  {role.ctaLabel} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
