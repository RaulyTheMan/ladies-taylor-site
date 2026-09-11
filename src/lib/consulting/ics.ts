// Minimal iCalendar generator. No dependency -- the spec surface we need is
// small, and every rule below is one that actually bites in practice.
//
// With no confirmation email, the .ics is the only durable record a guest gets:
// it is what puts the time somewhere they will see it
// again. Treat it as a deliverable, not a nicety.

const CRLF = "\r\n";

/** RFC 5545 escaping for TEXT values. Backslash first, or you double-escape. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Folds a line to 75 octets with a leading space on each continuation.
 *
 * Not optional: a meeting URL inside DESCRIPTION comfortably exceeds 75, and an
 * unfolded line produces invites that silently fail to parse in some clients.
 * Counts BYTES, not characters -- an emoji in a title is 4 octets.
 */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let start = 0;
  let limit = 75;

  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Never split a multi-byte character: back up off a continuation byte.
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) {
      end -= 1;
    }
    chunks.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74; // continuations carry a leading space
  }

  return chunks.join(`${CRLF} `);
}

/** UTC basic format. Emitting UTC sidesteps VTIMEZONE entirely. */
function toIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export type IcsInput = {
  uid: string;
  startAt: string;
  endAt: string;
  title: string;
  description: string;
  location: string;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
  /**
   * A cancellation reuses the SAME uid with METHOD:CANCEL and SEQUENCE:1, which
   * is what makes Gmail and Outlook actually remove the event rather than
   * leaving a ghost on the guest's calendar.
   */
  cancelled?: boolean;
};

export function buildIcs(input: IcsInput): string {
  const cancelled = Boolean(input.cancelled);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ladies Taylor//Consulting//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${cancelled ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `SEQUENCE:${cancelled ? 1 : 0}`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${toIcsUtc(input.startAt)}`,
    `DTEND:${toIcsUtc(input.endAt)}`,
    `SUMMARY:${escapeText(input.title)}`,
    `DESCRIPTION:${escapeText(input.description)}`,
    `LOCATION:${escapeText(input.location)}`,
    `ORGANIZER;CN=Ladies Taylor:mailto:${input.organizerEmail}`,
    `ATTENDEE;CN=${escapeText(input.attendeeName)};RSVP=FALSE:mailto:${input.attendeeEmail}`,
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // Trailing CRLF matters too -- some parsers drop an unterminated final line.
  return lines.map(fold).join(CRLF) + CRLF;
}
