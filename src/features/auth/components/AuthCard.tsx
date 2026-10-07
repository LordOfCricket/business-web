import type { ReactNode } from "react";
import { SportArt } from "@/components/sports/SportArt";

/** Sign-in, sign-up and recovery screens: the form beside a quiet brand panel (form only on phones). */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-surface ring-1 ring-line md:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-[#22392d] p-10 text-paper md:flex">
        <SportArt
          kind="cricket"
          className="pointer-events-none absolute -right-24 -bottom-16 h-[80%] w-auto text-paper/20"
        />
        <p className="text-xs font-semibold tracking-[0.2em] text-paper/70 uppercase">LordOfSportz</p>
        <p className="display relative text-4xl leading-[1.05]">
          Run your sports business.
          <br />
          In one place.
        </p>
        <p className="relative max-w-xs text-sm text-paper/75">
          Venues and bookings, your shop, coaches and staff, tournaments and scoring, verified and on
          LordOfSportz.
        </p>
      </div>
      <div className="flex flex-col gap-8 p-6 sm:p-10">
        <div className="flex flex-col gap-2">
          <h1 className="display text-3xl leading-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
