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

export const BUSINESS_STAGES = [
  "New Business",
  "Existing brand needing a refresh",
  "Rebrand after a name change",
  "Legacy Business",
] as const;

export const ROLES = [
  "Marketing Manager",
  "Business Owner",
  "CXO",
  "Other",
] as const;

export const BRANDING_STATES = ["Yes", "No", "Somewhat"] as const;

export const TIMELINES = [
  "1-2 Weeks",
  "2-4 Weeks",
  "4-6 Weeks",
  "Long Term",
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
export type BusinessStage = (typeof BUSINESS_STAGES)[number];
export type Role = (typeof ROLES)[number];
export type BrandingState = (typeof BRANDING_STATES)[number];
export type Timeline = (typeof TIMELINES)[number];
export type Budget = (typeof BUDGETS)[number];
