// Timezone helpers. Intl only -- no date library, deliberately.
//
// Everything genuinely hard about scheduling (DST-correct wall-clock-to-instant
// conversion, weekly recurrence expansion, keeping the tz database current)
// happens in Postgres inside consultation_open_slots(), which has the full tz
// database and gets it right. What is left in TypeScript is formatting, which
// Intl does natively. date-fns-tz or Luxon would add 20-70 kB to solve problems
// this design does not have.
//
// NOTE: src/lib/ui/formatDate.ts is pinned to UTC and cannot be reused for
// booking times -- it would print a 4pm IST call as 10:30.

/** The business's own clock. Bookings are quoted in this zone. */
export const HOST_TIMEZONE = "Asia/Kolkata";

/**
 * The calendar day an instant falls on, IN A GIVEN ZONE, as YYYY-MM-DD.
 *
 * The "en-CA" locale is the trick: it formats as YYYY-MM-DD natively, so this
 * needs no padding or reassembly. Grouping slots by `new Date(iso).getDate()`
 * instead would silently group by the *server's* day and put a 00:30 IST slot
 * on the wrong date.
 */
export function isoDayInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatTimeInZone(
  iso: string,
  timeZone: string,
  hour12 = true
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12,
  }).format(new Date(iso));
}

export function formatDateInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Date + time in one string. Server-safe ONLY when `timeZone` is a fixed value
 * such as HOST_TIMEZONE -- passing the viewer's zone during render produces a
 * hydration mismatch, because the server resolves it to the deploy region's.
 */
export function formatDateTimeInZone(
  iso: string | null | undefined,
  timeZone: string = HOST_TIMEZONE
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDateInZone(iso, timeZone)}, ${formatTimeInZone(iso, timeZone)}`;
}

/** e.g. "IST" / "GMT+5:30" -- whatever the runtime has a name for. */
export function zoneAbbreviation(timeZone: string, at: Date = new Date()): string {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? timeZone;
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * The offset, in ms, that `timeZone` is ahead of UTC at a given instant.
 * Derived by formatting the instant in that zone and reading the parts back —
 * the only way to get this from Intl without a date library.
 */
function zoneOffsetMs(at: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value])
  ) as Record<string, string>;

  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asIfUtc - at.getTime();
}

/**
 * Turns a wall-clock date + time IN A ZONE into a real instant.
 *
 * Used only for blackouts, where the admin types "14 March, all day" and means
 * midnight-to-midnight in the host's own zone. Availability rules never come
 * through here — those are converted inside consultation_open_slots() in SQL,
 * which is the one place a recurring wall-clock rule becomes an instant.
 *
 * The offset is applied twice because the first pass is measured at the wrong
 * instant; the second lands on the right side of a DST boundary. Asia/Kolkata
 * has no DST so this is belt and braces there, but it costs nothing and makes
 * the helper correct for any zone.
 */
export function wallClockToInstant(
  day: string,
  time: string,
  timeZone: string = HOST_TIMEZONE
): Date {
  const naive = new Date(`${day}T${time}:00Z`);
  const firstPass = new Date(naive.getTime() - zoneOffsetMs(naive, timeZone));
  return new Date(naive.getTime() - zoneOffsetMs(firstPass, timeZone));
}

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
