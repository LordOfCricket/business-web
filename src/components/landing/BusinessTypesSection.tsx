import Link from "next/link";
import {
  AcademyIcon,
  VenueIcon,
  SportsCenterIcon,
  TrainingCenterIcon,
  ClubIcon,
  CoachIcon,
  TournamentIcon,
  OfficialIcon,
  CheckmarkIcon,
} from "./LandingIcons";

interface BusinessTypeItem {
  id: string;
  title: string;
  badge: string;
  icon: typeof AcademyIcon;
  description: string;
  manageItems: string[];
  ctaLabel: string;
  ctaHref: string;
}

const BUSINESS_TYPES: BusinessTypeItem[] = [
  {
    id: "academy",
    title: "Sports Academy",
    badge: "Youth & Elite Training",
    icon: AcademyIcon,
    description:
      "For specialized coaching academies managing multiple sports, student rosters, progressive graduations, and branch networks.",
    manageItems: [
      "Sports, disciplines & styles",
      "Coaches & staff allocations",
      "Students & athlete rosters",
      "Multi-location branches (0, 1, or many)",
      "Training programs & batches",
      "Weekly batch timetables",
      "Gradings & belt promotions",
      "Tournaments & achievements",
      "Student & parent reviews",
      "Dedicated dojo & hall facilities",
    ],
    ctaLabel: "Register Academy",
    ctaHref: "/onboarding/business?type=ACADEMY",
  },
  {
    id: "venue",
    title: "Ground / Venue Owner",
    badge: "Turf & Court Management",
    icon: VenueIcon,
    description:
      "For natural cricket stadiums, football turfs, badminton courts, tennis arenas, and recreational facilities.",
    manageItems: [
      "Pitches, courts & practice nets",
      "Boundary dimensions & turf specs",
      "Dynamic peak/off-peak slot engine",
      "Automated calendar & booking blocks",
      "Floodlights, pavilion & dressing rooms",
      "Canteen, parking & spectator capacity",
      "Ground staff & maintenance logs",
      "Public venue visibility on LOS app",
    ],
    ctaLabel: "Register Venue",
    ctaHref: "/onboarding/business?type=VENUE_OWNER",
  },
  {
    id: "sports-center",
    title: "Sports Center",
    badge: "Multi-Sport Hubs",
    icon: SportsCenterIcon,
    description:
      "For unified sports complexes hosting multiple disciplines under one roof with shared facilities and member passes.",
    manageItems: [
      "Multi-sport catalog (Cricket, Football, Gym, Badminton)",
      "Facility & court inventory",
      "Monthly & annual memberships",
      "Shared facility scheduling",
      "Multi-discipline coaching squads",
      "Integrated payments & billing",
    ],
    ctaLabel: "Register Sports Center",
    ctaHref: "/onboarding/business?type=SPORTS_CENTER",
  },
  {
    id: "training-center",
    title: "Training Center",
    badge: "High Performance",
    icon: TrainingCenterIcon,
    description:
      "For high-performance athletic training facilities, strength & conditioning centers, and athlete recovery academies.",
    manageItems: [
      "Specialized training regimes",
      "Biomechanical & fitness assessment",
      "Elite athlete performance tracking",
      "Certified trainers & physiotherapists",
      "High-performance batches & slots",
      "Equipment & gym floor access",
    ],
    ctaLabel: "Register Training Center",
    ctaHref: "/onboarding/business?type=TRAINING_CENTER",
  },
  {
    id: "club",
    title: "Sports Club",
    badge: "Teams & Franchises",
    icon: ClubIcon,
    description:
      "For amateur, corporate, and competitive sports clubs managing team rosters, league fixtures, and official sponsors.",
    manageItems: [
      "Club profile & branding",
      "First team & academy squads",
      "Contracted players & coaches",
      "Fixture calendar & match results",
      "Tournaments & championship honors",
      "Sponsor logos & commercial partners",
    ],
    ctaLabel: "Register Club",
    ctaHref: "/onboarding/business?type=CLUB",
  },
  {
    id: "coach",
    title: "Coach / Sports Professional",
    badge: "Individual Specialist",
    icon: CoachIcon,
    description:
      "For certified head coaches, assistant trainers, fitness specialists, and mentors offering private or group coaching.",
    manageItems: [
      "Primary sport, discipline & specialization",
      "Structured chronological coaching history",
      "Federation licenses & certifications",
      "Verified medals, titles & awards",
      "Student & notable athlete rosters",
      "Weekly working hours & booking calendar",
      "Public SEO profile with reviews",
    ],
    ctaLabel: "Create Coach Profile",
    ctaHref: "/onboarding/professional?role=coach",
  },
  {
    id: "tournament-organizer",
    title: "Tournament Organizer",
    badge: "Leagues & Cups",
    icon: TournamentIcon,
    description:
      "For sports organizers running corporate leagues, school championships, open tournaments, and sanctioned events.",
    manageItems: [
      "Tournament registration & fees",
      "Age, gender & skill eligibility rules",
      "Knockout & league draw generation",
      "Venue & court fixture allocation",
      "Certified referee & scorer staffing",
      "Real-time ball-by-ball scoring",
      "Digital certificates & leaderboard",
    ],
    ctaLabel: "Launch Tournament",
    ctaHref: "/onboarding/business?capability=COMPETITIONS",
  },
  {
    id: "official",
    title: "Official / Referee / Umpire",
    badge: "Certified Match Officials",
    icon: OfficialIcon,
    description:
      "For BCCI umpires, AIFF referees, WKF karate judges, and certified match scorers presiding over competitive fixtures.",
    manageItems: [
      "Sport-specific roles (Umpire, Referee, Judge, Scorer)",
      "Federation license number & badge level",
      "Match officiating timeline & tournament logs",
      "Current status & disciplinary compliance",
      "Availability calendar for match duty",
      "Official match assignment requests",
    ],
    ctaLabel: "Register as Official",
    ctaHref: "/onboarding/professional?role=official",
  },
];

export function BusinessTypesSection() {
  return (
    <section id="solutions" aria-labelledby="types-title" className="py-14 sm:py-20 border-t border-line">
      <div className="flex flex-col items-center text-center">
        <span className="kicker">TAILORED OPERATIONAL WORKSPACES</span>
        <h2 id="types-title" className="display mt-2 text-3xl font-normal text-ink sm:text-5xl">
          Built for every kind of sports business
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Select your sports role. Each entity receives a specialized, sports-aware workspace configured
          with the exact capabilities needed to operate efficiently.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
        {BUSINESS_TYPES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-3xl border border-line bg-surface p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-600/40 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-800 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[10px] font-semibold text-muted">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{item.description}</p>

                <div className="mt-5 border-t border-line/70 pt-4">
                  <p className="text-[11px] font-semibold tracking-wider text-brand-900 uppercase">
                    Key Capabilities:
                  </p>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {item.manageItems.slice(0, 6).map((cap) => (
                      <li key={cap} className="flex items-start gap-2 text-xs text-muted">
                        <CheckmarkIcon className="size-3.5 shrink-0 text-brand-600 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                    {item.manageItems.length > 6 && (
                      <li className="text-[11px] font-medium text-brand-700 pl-5">
                        +{item.manageItems.length - 6} more capabilities
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line/70">
                <Link
                  href={item.ctaHref}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-canvas py-2.5 text-xs font-semibold text-ink transition hover:bg-brand-600 hover:text-white group-hover:bg-brand-600 group-hover:text-white"
                >
                  {item.ctaLabel} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
