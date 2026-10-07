import Link from "next/link";
import { Card } from "@/components/ui";
import { APP } from "@/constants/app";

const BUSINESS_TYPES = [
  "Sports Academy",
  "Ground / Venue Owner",
  "Sports Center",
  "Training Center",
  "Club",
  "Coach & Professionals",
];

export default function BusinessHomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="hero-title" className="flex flex-col gap-4 pt-8">
        <h1 id="hero-title" className="text-4xl font-bold tracking-tight">
          {APP.tagline}
        </h1>
        <p className="max-w-2xl text-lg text-muted">{APP.description}</p>
        <div>
          <Link
            href="/onboarding/business"
            className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-brand-900"
          >
            Register your business
          </Link>
          <Link
            href="/onboarding/professional"
            className="ml-3 inline-flex rounded-full border border-ink/15 bg-surface px-5 py-3 text-sm font-medium hover:border-ink/40"
          >
            I am a coach or official
          </Link>
        </div>
      </section>

      <section aria-labelledby="types-title" className="flex flex-col gap-4">
        <h2 id="types-title" className="text-2xl font-semibold">
          Built for every kind of sports business
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_TYPES.map((type) => (
            <li key={type}>
              <Card className="font-medium">{type}</Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
