import { NextResponse } from "next/server";
import { getBookingByToken } from "@/lib/consulting";
import { buildIcs } from "@/lib/consulting/ics";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { HOST_TIMEZONE, formatDateTimeInZone } from "@/lib/consulting/time";

const ORGANIZER_EMAIL =
  process.env.CONSULTING_HOST_EMAIL ??
  process.env.CONTACT_NOTIFICATION_EMAIL ??
  "hello@ladiestaylor.com";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`consult-ics:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { token } = await params;
  const booking = await getBookingByToken(token);
  if (!booking) return new NextResponse("Not found", { status: 404 });

  const cancelled = booking.status === "cancelled";
  if (!cancelled && booking.status !== "confirmed") {
    return new NextResponse("Not found", { status: 404 });
  }

  const details = [
    `${booking.title} with Ladies Taylor.`,
    "",
    `When: ${formatDateTimeInZone(booking.startAt, HOST_TIMEZONE)} IST`,
    "Meeting link: we'll message it to you before the call.",
    "",
    "Manage this booking:",
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ladiestaylor.com"}/consulting/booking/${token}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ics = buildIcs({
    // Stable across the booking and its cancellation, so METHOD:CANCEL actually
    // removes the event instead of adding a second one.
    uid: `${booking.id}@ladiestaylor.com`,
    startAt: booking.startAt,
    endAt: booking.endAt,
    title: `${booking.title} — Ladies Taylor`,
    description: details,
    location: booking.locationLabel,
    organizerEmail: ORGANIZER_EMAIL,
    attendeeEmail: booking.email,
    attendeeName: booking.name,
    cancelled,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="ladies-taylor-consultation.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
