export const APP = {
  name: "LordOfSportz Business",
  tagline: "Run your sports business in one place.",
  description:
    "Manage venues, facilities, bookings, coaches and staff, and sell sports products on the LordOfSportz marketplace.",
} as const;

/**
 * Header links (spec §21). Inside the dashboard the sidebar menu depends on the organization's capabilities:
 * VENUE_OPERATOR → venues/facilities/bookings, SELLER → products/inventory/orders, ACADEMY/PROFESSIONAL_SERVICES → staff.
 */
export const NAV_LINKS = [
  { href: "/workspace", label: "Workspaces" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/venues", label: "Venues" },
  { href: "/staff", label: "Staff" },
  { href: "/profile", label: "My coaching profile" },
  { href: "/profile/reviews", label: "My reviews" },
  { href: "/scoring", label: "Scoring" },
  { href: "/refereeing", label: "Refereeing" },
  { href: "/umpiring", label: "Umpiring" },
] as const;
