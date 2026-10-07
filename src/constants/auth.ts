export interface AuthRule {
  prefixes: string[];
  roles?: string[];
  forbiddenRedirect?: string;
}

/**
 * Business portal: onboarding needs any signed-in user; the dashboard modules need the OWNER role
 * (granted by identity once the user belongs to a business) or ADMIN.
 */
export const AUTH_RULES: AuthRule[] = [
  { prefixes: ["/onboarding", "/account", "/profile", "/notifications"] }, // individual professionals are CUSTOMER users
  {
    prefixes: [
      "/dashboard",
      "/venues",
      "/facilities",
      "/bookings",
      "/products",
      "/inventory",
      "/orders",
      "/staff",
      "/payments",
      "/reviews",
      "/settings",
      "/tournaments",
    ],
    roles: ["OWNER", "ADMIN"],
    forbiddenRedirect: "/onboarding/business",
  },
];
