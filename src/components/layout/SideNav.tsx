"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export interface SideNavGroup {
  title?: string;
  items: Array<{ href: string; label: string }>;
}

/**
 * Portal navigation: grouped in a sticky sidebar on wide screens, one scrollable row of pills on phones. The most
 * specific matching link is marked current, so /shop/orders does not also light up /shop.
 */
export function SideNav({ groups, label }: { groups: SideNavGroup[]; label: string }) {
  const pathname = usePathname();
  const all = groups.flatMap((g) => g.items);
  const current = all
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const link = (href: string, text: string, pill: boolean) => (
    <Link
      href={href}
      aria-current={current === href ? "page" : undefined}
      className={cn(
        pill
          ? "inline-flex h-9 items-center rounded-full px-4 text-sm whitespace-nowrap"
          : "block rounded-full px-3 py-1.5 text-sm transition-colors",
        current === href
          ? "bg-ink text-paper"
          : pill
            ? "ring-1 ring-line"
            : "text-ink/80 hover:bg-ink/5 hover:text-ink",
      )}
    >
      {text}
    </Link>
  );
  return (
    <nav aria-label={label} className="md:sticky md:top-24 md:w-56 md:shrink-0 md:self-start">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
        {all.map((i) => (
          <li key={i.href}>{link(i.href, i.label, true)}</li>
        ))}
      </ul>
      <div className="hidden flex-col gap-6 md:flex">
        {groups.map((g, gi) => (
          <div key={g.title ?? gi} className="flex flex-col gap-1">
            {g.title && <p className="kicker px-3 pb-1">{g.title}</p>}
            <ul className="flex flex-col">
              {g.items.map((i) => (
                <li key={i.href}>{link(i.href, i.label, false)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
