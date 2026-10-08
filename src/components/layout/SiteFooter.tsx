import Link from "next/link";
import { APP } from "@/constants/app";
import { Wordmark } from "./SiteHeader";

const FOOTER_GROUPS = [
  {
    title: "Workspaces",
    links: [
      { href: "/workspace?type=academy", label: "Sports Academy" },
      { href: "/workspace?type=venue", label: "Ground & Venue" },
      { href: "/workspace?type=sports-center", label: "Sports Center" },
      { href: "/workspace?type=club", label: "Sports Club" },
      { href: "/profile", label: "Coach Profile" },
      { href: "/workspace?type=official", label: "Referee & Umpire Desk" },
      { href: "/tournaments", label: "Tournament Operations" },
      { href: "/shop", label: "Official LOS Shop" },
    ],
  },
  {
    title: "Sports Supported",
    links: [
      { href: "/#sports", label: "Cricket (Turf & Nets)" },
      { href: "/karate", label: "Karate (Dojos & Gradings)" },
      { href: "/#sports", label: "Football (Turf & Leagues)" },
      { href: "/#sports", label: "Tennis (Courts & Ladders)" },
      { href: "/#sports", label: "Badminton (Wooden & Mats)" },
      { href: "/#sports", label: "Martial Arts & Combat" },
    ],
  },
  {
    title: "Features & Operations",
    links: [
      { href: "/venues", label: "Venue & Slot Engine" },
      { href: "/scoring", label: "Live Match Scoring" },
      { href: "/refereeing", label: "Referee Match Logs" },
      { href: "/umpiring", label: "Umpire Assignments" },
      { href: "/staff", label: "Role-Based Staff Access" },
      { href: "/settings?tab=documents", label: "Business Verification" },
    ],
  },
  {
    title: "Ecosystem & Legal",
    links: [
      { href: "/onboarding/business", label: "Register your business" },
      { href: "/onboarding/professional", label: "Join as a Coach or Official" },
      { href: "/account", label: "Account Security" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface/80">
      <div className="container-site py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <Link href="/" className="flex items-baseline gap-2">
              <Wordmark />
              <span className="kicker">Business</span>
            </Link>
            <p className="text-xs leading-relaxed text-muted">
              Professional operating platform for sports academies, venues, coaches, officials, and tournaments.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
              <span className="size-2 rounded-full bg-brand-600" />
              <span>LordOfSportz Network Active</span>
            </div>
          </div>

          {/* Navigation link groups */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-wider text-ink uppercase">{group.title}</p>
                <ul className="flex flex-col gap-2 text-xs">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted transition hover:text-ink hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {APP.name}. All rights reserved.
          </p>
          <p className="italic font-display text-[13px] text-ink">
            {APP.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
