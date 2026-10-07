import Link from "next/link";
import { APP, NAV_LINKS } from "@/constants/app";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { getSession } from "@/lib/auth/session";
import { isLaunched } from "@/lib/sports/launch";
import { DesktopNav, HeaderShell, MobileNav } from "./HeaderChrome";
import { UserMenu } from "./UserMenu";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-xl tracking-tight ${className}`}>
      LordOf<span className="italic">Sportz</span>
    </span>
  );
}

/** The business portal's header: wordmark, the main areas, notifications and the account. */
export async function SiteHeader() {
  const session = await getSession();
  // sport-specific areas appear once their sport is launched (lib/sports/launch.ts)
  const SPORT_AREAS: Record<string, string[]> = {
    "/scoring": ["cricket"],
    "/refereeing": ["karate", "football"],
    "/umpiring": ["tennis", "badminton"],
  };
  const links = NAV_LINKS.filter((l) => !SPORT_AREAS[l.href] || SPORT_AREAS[l.href]!.some(isLaunched));
  return (
    <HeaderShell>
      <div className="container-site flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          aria-label={`${APP.name} home`}
          className="flex shrink-0 items-baseline gap-2 rounded-md"
        >
          <Wordmark />
          <span className="kicker">Business</span>
        </Link>
        <DesktopNav links={links} from="xl" />
        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell />
          <UserMenu />
          <MobileNav
            links={links}
            from="xl"
            signedIn={Boolean(session)}
            guest={[
              { href: "/login", label: "Log in" },
              { href: "/register", label: "Create a business account" },
            ]}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
