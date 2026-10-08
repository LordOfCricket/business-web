import Link from "next/link";
import { SparklesIcon, ShieldCheckIcon } from "./LandingIcons";

export function FinalCtaSection() {
  return (
    <section aria-labelledby="cta-title" className="py-14 sm:py-20 border-t border-line">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-paper sm:px-14 sm:py-20">
        {/* Subtle ambient lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 flex justify-center overflow-hidden"
        >
          <div className="h-[300px] w-[600px] rounded-full bg-brand-700/25 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/10 px-3.5 py-1 text-xs text-paper backdrop-blur-xs">
            <SparklesIcon className="size-4 text-brand-200" />
            <span className="font-semibold tracking-wider uppercase">JOIN THE LORDOFSPORTZ NETWORK</span>
          </div>

          <h2 id="cta-title" className="display mt-6 text-3xl font-normal leading-tight sm:text-5xl lg:text-6xl">
            Transform your sports operations today.
          </h2>

          <p className="mt-5 text-sm leading-relaxed text-paper/80 sm:text-lg">
            Empower your academy, venue, coaching practice, or tournament with the country&apos;s most complete
            sports operating platform.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
            <Link
              href="/onboarding/business"
              className="inline-flex h-12 items-center justify-center rounded-full bg-paper px-8 text-sm font-semibold text-ink shadow-sm transition hover:bg-white"
            >
              Register your business
            </Link>
            <Link
              href="/onboarding/professional"
              className="inline-flex h-12 items-center justify-center rounded-full border border-paper/25 bg-transparent px-7 text-sm font-semibold text-paper transition hover:border-paper/60 hover:bg-paper/10"
            >
              I&apos;m a coach or official
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-paper/60">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheckIcon className="size-4 text-brand-200" />
              Verified Sports Credentials
            </span>
            <span>·</span>
            <span>No Long-Term Contracts</span>
            <span>·</span>
            <span>Multi-Sport Architecture</span>
          </div>
        </div>
      </div>
    </section>
  );
}
