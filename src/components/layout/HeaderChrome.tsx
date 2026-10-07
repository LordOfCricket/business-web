"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/shared/Icons";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";

type NavLink = { href: string; label: string };

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Sticky header frame: a translucent paper backdrop, and a hairline once the page scrolls. The blur sits on a
 * pseudo-element: `backdrop-filter` on the header itself would become the containing block of the fixed-position
 * mobile menu and squeeze it into the header's 64px.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 border-b border-transparent transition-[border-color] duration-300 before:absolute before:inset-0 before:-z-10 before:bg-canvas/80 before:backdrop-blur-md data-[scrolled]:border-line data-[scrolled]:before:bg-canvas/92"
    >
      {children}
    </header>
  );
}

/** Desktop navigation with the current section marked. */
/** Below `from` the links move into the menu sheet; pass the same value to MobileNav. */
export type NavBreakpoint = "lg" | "xl";

export function DesktopNav({ links, from = "lg" }: { links: readonly NavLink[]; from?: NavBreakpoint }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={from === "xl" ? "hidden xl:block" : "hidden lg:block"}>
      <ul className="flex items-center gap-0.5 xl:gap-1">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-full px-3.5 py-2 text-sm whitespace-nowrap transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {link.label}
                {active && (
                  <span aria-hidden="true" className="absolute inset-x-3.5 -bottom-0.5 h-px bg-ink" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Phone and tablet navigation: a full-width sheet under the header. Closes on navigation, on Escape and when the
 * viewport grows past the desktop breakpoint; focus returns to the toggle.
 */
const GUEST_LINKS: readonly NavLink[] = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Get started" },
];

export function MobileNav({
  links,
  secondary = [],
  signedIn,
  guest = GUEST_LINKS,
  accountHref = "/account",
  from = "lg",
}: {
  links: readonly NavLink[];
  secondary?: readonly NavLink[];
  signedIn: boolean;
  /** Calls to action for signed-out visitors; the last one is the primary. */
  guest?: readonly NavLink[];
  accountHref?: string;
  from?: NavBreakpoint;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  // close whenever the route changes (the header persists across navigations)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const desktop = window.matchMedia(from === "xl" ? "(min-width: 1280px)" : "(min-width: 1024px)");
    const onResize = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = "";
    };
  }, [open, from]);

  return (
    <div className={from === "xl" ? "xl:hidden" : "lg:hidden"}>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-ink/5"
      >
        {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-canvas"
      >
        <nav aria-label="Mobile" className="container-site flex flex-col gap-10 py-8">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href} className="border-b border-line">
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="display flex items-center justify-between py-4 text-3xl aria-[current=page]:text-brand-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {secondary.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 text-sm">
              {secondary.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {signedIn ? (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={accountHref}
                className="inline-flex h-12 items-center justify-center rounded-full border border-ink/15 text-sm font-medium"
              >
                My account
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-ink/15 text-sm font-medium"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className={cn("grid gap-3", guest.length > 1 && "grid-cols-2")}>
              {guest.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex h-12 items-center justify-center rounded-full text-sm font-medium",
                    i === guest.length - 1 ? "bg-ink text-paper" : "border border-ink/15",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
