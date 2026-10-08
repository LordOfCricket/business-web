import {
  CalendarDaysIcon,
  BeltAwardIcon,
  UsersGroupIcon,
  BranchesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from "./LandingIcons";

interface FeatureCard {
  icon: typeof CalendarDaysIcon;
  title: string;
  badge: string;
  description: string;
  metric: string;
  metricLabel: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: CalendarDaysIcon,
    title: "Slot Engine & Real-Time Availability",
    badge: "Venues & Courts",
    description:
      "Intelligent reservation engine with custom slot durations (30, 60, 90 mins), buffer gaps, blackout maintenance blocks, and peak holiday surge pricing.",
    metric: "0 Overlaps",
    metricLabel: "Instant multi-pitch concurrency lock",
  },
  {
    icon: BeltAwardIcon,
    title: "Athlete & Student Progress Engine",
    badge: "Academies & Coaches",
    description:
      "Sport-specific milestone progressions including Kyu-to-Dan belt gradings for martial arts, technical batting drills, and player fitness tracking.",
    metric: "100% Tracked",
    metricLabel: "Graduation eligibility & attendance logs",
  },
  {
    icon: UsersGroupIcon,
    title: "Granular Role-Based Permissions",
    badge: "Security & Governance",
    description:
      "Fine-grained access rights separating Owners, Managers, Head Coaches, Assistant Staff, Ground Keepers, Scorers, and Finance Administrators.",
    metric: "6+ Roles",
    metricLabel: "No unauthorized access to financial records",
  },
  {
    icon: BranchesIcon,
    title: "Multi-Branch Operational Network",
    badge: "Scalable Operations",
    description:
      "Manage single-location entities or regional multi-branch academies with independent addresses, staff assignments, and unified executive reporting.",
    metric: "0 to Many",
    metricLabel: "Branch-level schedules & inventory",
  },
  {
    icon: ShieldCheckIcon,
    title: "Verified Federation Credentials",
    badge: "Trust & Safety",
    description:
      "Verified federation license numbers, NIS certifications, and BCCI/AIFF/WKF accreditations displayed publicly to earn athlete and parent trust.",
    metric: "Verified Badge",
    metricLabel: "Document review by LordOfSportz team",
  },
  {
    icon: ChartBarIcon,
    title: "Integrated Financial Intelligence",
    badge: "Revenue & Payouts",
    description:
      "Real-time revenue tracking across slot bookings, tournament entry fees, and academy batch memberships with automated payouts and GST-compliant invoices.",
    metric: "Real-Time",
    metricLabel: "Automated settlements & reconciliations",
  },
];

export function FeaturesSection() {
  return (
    <section aria-labelledby="features-title" className="py-14 sm:py-20 border-t border-line">
      <div className="flex flex-col items-center text-center">
        <span className="kicker">ENGINEERED FOR EXCELLENCE</span>
        <h2 id="features-title" className="display mt-2 text-3xl font-normal text-ink sm:text-5xl">
          Infrastructure built for sports scale
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Every tool is designed to eliminate operational friction so administrators and coaches can focus
          on player development and match excellence.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
        {FEATURES.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-7 transition hover:border-brand-600/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-800">
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[10px] font-semibold text-muted">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-ink">{feat.title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-muted">{feat.description}</p>
              </div>

              <div className="mt-6 rounded-2xl bg-canvas/70 p-4 ring-1 ring-line">
                <p className="text-base font-bold text-brand-900">{feat.metric}</p>
                <p className="text-[11px] text-muted">{feat.metricLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
