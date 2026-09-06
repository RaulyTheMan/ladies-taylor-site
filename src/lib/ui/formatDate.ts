/**
 * Deterministic date formatting for anything rendered on both the server and
 * the client.
 *
 * `toLocaleDateString()` with no arguments reads the *runtime's* locale and
 * timezone, which differ between the Node server and the viewer's browser —
 * the same row rendered "01/08/2026" server-side and "8/1/2026" client-side,
 * which React reports as a hydration failure and then re-renders the tree.
 * Pinning both makes the two agree.
 *
 * The format is also deliberately unambiguous: "01 Aug 2026" cannot be
 * misread, whereas 01/08/2026 means August 1st to some readers and January
 * 8th to others.
 */
const FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a date/timestamp string, returning an em dash for null or unparseable input. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : FORMATTER.format(date);
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/**
 * Same reasoning as formatDate, for timestamps that need the time of day.
 * UTC is stated in the output because a moderator reading a chat log needs to
 * know which clock the times are on.
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : `${DATE_TIME_FORMATTER.format(date)} UTC`;
}
