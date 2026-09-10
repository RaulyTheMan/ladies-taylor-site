/**
 * Option sets for the August query form, shared by the client component and
 * the API route so the two can't drift. These are mirrored by CHECK
 * constraints on `august_query_submissions` — adding a value here means
 * widening the constraint in the same change.
 */

export const SERVICES = [
  "Website Design",
  "Branding",
  "Packaging",
  "Social Media",
  "All of the above",
] as const;

export const BUDGETS = ["50k - 75k", "75k - 1L", "1L - 2L", "3L+"] as const;

/**
 * Display-only overrides. The stored value stays clean so the CRM and the
 * Meta payload never carry the joke.
 */
export const BUDGET_LABELS: Record<(typeof BUDGETS)[number], string> = {
  "50k - 75k": "50k - 75k",
  "75k - 1L": "75k - 1L",
  "1L - 2L": "1L - 2L",
  "3L+": "3L+ (calm down tiger)",
};

export type Service = (typeof SERVICES)[number];
export type Budget = (typeof BUDGETS)[number];

/**
 * Funnel labels, one per screen plus the two outcomes. Zero-padded so a plain
 * `order by step` reads in flow order. Shared with the progress route so the
 * client cannot record a step the server does not recognise.
 */
export const FUNNEL_STEPS = [
  "01_services",
  "02_budget",
  "03_details",
  "submitted",
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];
