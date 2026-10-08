import type { ReactNode } from "react";
import { SideNav, type SideNavGroup } from "@/components/layout/SideNav";
import { Badge } from "@/components/ui";
import { getMyOrganizations } from "@/features/org/api";
import { humanize, STATUS_TONE } from "@/features/org/constants";
import { requireBusiness } from "@/features/org/context";
import { OrgSwitcher } from "@/features/org/OrgSwitcher";
import { isLaunched } from "@/lib/sports/launch";

export const dynamic = "force-dynamic";

/**
 * Business dashboard shell (spec §21). The menu follows the business's approved capabilities: venues appear for
 * VENUE_OPERATOR, the shop (products, inventory, orders, discounts, sales) for SELLER.
 */
/** Sidebar sections: the shop's pages together, each sport's tournaments together, settings last. */
function groupNav(items: Array<{ href: string; label: string }>): SideNavGroup[] {
  const pick = (test: (href: string) => boolean) => items.filter((i) => test(i.href));
  const groups: SideNavGroup[] = [
    { items: pick((h) => h === "/dashboard" || h === "/workspace") },
    { title: "Academy", items: pick((h) => h.includes("/academy")) },
    { title: "Venues", items: pick((h) => h === "/venues" || h === "/bookings" || h.includes("/venue")) },
    { title: "Shop", items: pick((h) => h.startsWith("/shop")) },
    {
      title: "Competitions",
      items: pick((h) => h.endsWith("/tournaments") || h.startsWith("/karate")),
    },
    {
      title: "Business",
      items: pick((h) => ["/payments", "/reviews", "/disputes", "/staff", "/settings"].includes(h)),
    },
  ];
  return groups.filter((g) => g.items.length > 0);
}

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const { session, org, capabilities } = await requireBusiness();
  const memberships = await getMyOrganizations(session.accessToken);
  const karate = org.status === "VERIFIED" && org.sports.includes("karate") && isLaunched("karate");
  const nav = [
    { href: "/dashboard", label: "Overview", show: true },
    { href: `/workspace/academy/${org.id}`, label: "Academy workspace", show: true },
    { href: "/workspace", label: "Switch workspace", show: true },
    { href: "/venues", label: "Venues & facilities", show: capabilities.includes("VENUE_OPERATOR") },
    { href: "/bookings", label: "Bookings", show: capabilities.includes("VENUE_OPERATOR") },
    { href: "/shop", label: "Shop", show: capabilities.includes("SELLER") },
    { href: "/shop/products", label: "Products", show: capabilities.includes("SELLER") },
    { href: "/shop/inventory", label: "Inventory", show: capabilities.includes("SELLER") },
    { href: "/shop/orders", label: "Orders", show: capabilities.includes("SELLER") },
    { href: "/shop/discounts", label: "Discounts", show: capabilities.includes("SELLER") },
    { href: "/shop/sales", label: "Sales", show: capabilities.includes("SELLER") },
    {
      href: "/payments",
      label: "Payments",
      show: capabilities.includes("VENUE_OPERATOR") || capabilities.includes("SELLER"),
    },
    {
      href: "/tournaments",
      label: "Tournaments",
      show: org.status === "VERIFIED" && org.sports.includes("cricket") && isLaunched("cricket"),
    },
    { href: "/karate", label: "Karate academy", show: karate },
    { href: "/karate/gradings", label: "Gradings", show: karate },
    { href: "/karate/tournaments", label: "Karate tournaments", show: karate },
    {
      href: "/tennis/tournaments",
      label: "Tennis tournaments",
      show: org.status === "VERIFIED" && org.sports.includes("tennis") && isLaunched("tennis"),
    },
    {
      href: "/badminton/tournaments",
      label: "Badminton tournaments",
      show: org.status === "VERIFIED" && org.sports.includes("badminton") && isLaunched("badminton"),
    },
    {
      href: "/football/tournaments",
      label: "Football tournaments",
      show: org.status === "VERIFIED" && org.sports.includes("football") && isLaunched("football"),
    },
    { href: "/reviews", label: "Reviews", show: true },
    { href: "/disputes", label: "Disputes", show: true },
    { href: "/staff", label: "Coaches & staff", show: true },
    { href: "/settings", label: "Business settings", show: true },
  ].filter((item) => item.show);

  return (
    <div className="flex flex-col gap-8 md:flex-row md:gap-12">
      <aside
        className="flex shrink-0 flex-col gap-6 md:sticky md:top-24 md:w-60 md:self-start"
        aria-label="Business"
      >
        <div className="flex flex-col gap-3 rounded-3xl bg-surface p-4 ring-1 ring-line">
          <OrgSwitcher
            current={org.id}
            options={memberships.map((m) => ({ value: m.orgId, label: m.name }))}
          />
          <Badge tone={STATUS_TONE[org.status]} className="self-start">
            {humanize(org.status)}
          </Badge>
        </div>
        <SideNav label="Business" groups={groupNav(nav)} />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
