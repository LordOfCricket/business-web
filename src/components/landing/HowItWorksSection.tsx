import Link from "next/link";
import { CheckmarkIcon } from "./LandingIcons";

interface WorkflowStep {
  number: string;
  title: string;
  kicker: string;
  description: string;
  actions: string[];
}

const STEPS: WorkflowStep[] = [
  {
    number: "01",
    title: "Create your sports organization",
    kicker: "STEP 1 · SETUP",
    description:
      "Choose your entity model: Academy, Ground / Venue, Sports Center, Club, or Professional Profile. Define your primary sport disciplines and submit verification documents.",
    actions: [
      "Select entity archetype & sport focus",
      "Add tax ID / registration documents",
      "Instant Owner workspace activation",
    ],
  },
  {
    number: "02",
    title: "Configure sports, branches & facilities",
    kicker: "STEP 2 · CONFIGURATION",
    description:
      "Add branches, courts, pitches, batting nets, dojos, coaches, and staff. Configure progressive batch programs, belt ranks, timetables, and dynamic hourly pricing rules.",
    actions: [
      "Define 0, 1, or multiple branch locations",
      "Set batch schedules & capacity limits",
      "Establish peak / off-peak pricing surges",
    ],
  },
  {
    number: "03",
    title: "Publish to the LordOfSportz network",
    kicker: "STEP 3 · CONNECT",
    description:
      "Go live with a verified public profile across LordOfSportz consumer web & mobile apps. Athletes, students, parents, and teams can discover, book slots, and enroll instantly.",
    actions: [
      "SEO-optimized verified public business URL",
      "Real-time slot availability sync",
      "Direct digital payments & booking confirmations",
    ],
  },
  {
    number: "04",
    title: "Operate daily sports excellence",
    kicker: "STEP 4 · RUN",
    description:
      "Run training sessions, track student attendance & belt gradings, assign certified match officials, record ball-by-ball tournament scores, and review unified financial analytics.",
    actions: [
      "Live scoring consoles & umpire match sheets",
      "Automated student attendance & grading notes",
      "Unified revenue & payout reporting",
    ],
  },
];

export function HowItWorksSection() {
  return (
    <section aria-labelledby="how-it-works-title" className="py-14 sm:py-20 border-t border-line">
      <div className="flex flex-col items-center text-center">
        <span className="kicker">PROGRESSIVE ONBOARDING &amp; OPERATIONS</span>
        <h2 id="how-it-works-title" className="display mt-2 text-3xl font-normal text-ink sm:text-5xl">
          How it works
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          From registration to daily match operations in four structured steps. Engineered for sports
          administrators who want zero operational clutter.
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="relative flex flex-col justify-between rounded-3xl border border-line bg-surface p-7 transition hover:border-brand-500/50 hover:shadow-md"
          >
            <div>
              <div className="flex items-baseline justify-between border-b border-line/70 pb-4">
                <span className="font-display text-4xl font-normal text-brand-700">{step.number}</span>
                <span className="kicker text-[10px] text-muted">{step.kicker}</span>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-ink leading-snug">{step.title}</h3>
              <p className="mt-3 text-xs leading-relaxed text-muted">{step.description}</p>
            </div>

            <ul className="mt-6 flex flex-col gap-2 border-t border-line/60 pt-4">
              {step.actions.map((act) => (
                <li key={act} className="flex items-start gap-2 text-[11px] text-muted">
                  <CheckmarkIcon className="size-3.5 shrink-0 text-brand-600 mt-0.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/onboarding/business"
          className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-xs font-semibold text-paper hover:bg-brand-900 transition"
        >
          Begin your business setup →
        </Link>
      </div>
    </section>
  );
}
