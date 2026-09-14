/**
 * Terms for the Mera Brand Maro form, shared by the client component and the
 * API route. Every clause must be ticked to submit.
 *
 * Changing any wording means bumping TERMS_VERSION: each stored row records
 * the version it agreed to, so old rows keep pointing at what they accepted.
 */
export const TERMS_VERSION = "2026-09-14";

export const TERMS = [
  "By checking this you agree that we will be able to immediately publish the logos and brand identity onto our social media platforms without prior approval.",
  "By checking this you agree that there will be no revisions or direct contact with the Ladies Taylor team or Rahul Babu.",
  "By checking this you accept that we can showcase this logo design in any and all product/design showcases in India and across the world.",
  "By checking this you understand that Ladies Taylor is under no obligation to definitely provide the logos to you by any time period or at all.",
] as const;
