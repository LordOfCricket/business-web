/** Labels shared by the business onboarding and settings screens (spec §5–§6). */
export const ORG_TYPES = [
  { value: "ACADEMY", label: "Sports academy" },
  { value: "VENUE_OWNER", label: "Ground / venue owner" },
  { value: "SPORTS_CENTER", label: "Sports center" },
  { value: "TRAINING_CENTER", label: "Training center" },
  { value: "CLUB", label: "Club" },
  { value: "OTHER", label: "Other sports business" },
];

export const CAPABILITIES = [
  { value: "VENUE_OPERATOR", label: "Run venues", hint: "List grounds, courts and turfs and take bookings." },
  { value: "ACADEMY", label: "Academy / coaching", hint: "Offer coaching programmes with your coaches." },
  { value: "SELLER", label: "Sell products", hint: "Sell sports equipment on the marketplace." },
  {
    value: "PROFESSIONAL_SERVICES",
    label: "Professional services",
    hint: "Provide umpires, referees, scorers or trainers.",
  },
];

export const DOC_TYPES = [
  { value: "REGISTRATION_CERTIFICATE", label: "Registration certificate" },
  { value: "TAX_ID", label: "Tax ID (GST / PAN)" },
  { value: "ID_PROOF", label: "Owner ID proof" },
  { value: "ADDRESS_PROOF", label: "Address proof" },
  { value: "OTHER", label: "Other document" },
];

export const ORG_ROLES = [
  { value: "STAFF", label: "Staff" },
  { value: "MANAGER", label: "Manager" },
  { value: "OWNER", label: "Owner" },
];

export const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral",
  PENDING_VERIFICATION: "warning",
  PENDING_APPROVAL: "warning",
  VERIFIED: "success",
  ACTIVE: "success",
  APPROVED: "success",
  REQUESTED: "warning",
  INACTIVE: "neutral",
  REJECTED: "danger",
  SUSPENDED: "danger",
  SUCCEEDED: "success",
  PARTIALLY_REFUNDED: "warning",
  REFUNDED: "neutral",
  PENDING: "warning",
  FAILED: "danger",
  CANCELLED: "neutral",
  CONFIRMED: "success",
  HELD: "warning",
  EXPIRED: "neutral",
  COMPLETED: "success",
  NO_SHOW: "danger",
};

export function label(options: Array<{ value: string; label: string }>, value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function humanize(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}
