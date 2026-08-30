/**
 * The single focus treatment for the whole studio.
 *
 * Deliberately black rather than the yellow accent: a focus indicator has to
 * clear 3:1 against what's next to it (WCAG 2.1 SC 1.4.11), and #ffce00 on
 * white measures 1.6:1 — it would look like an accent while failing as an
 * indicator. Yellow earns its keep on the nav marker and accent badges, where
 * it always sits behind black text.
 */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-fg focus-visible:outline";
