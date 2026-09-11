"use client";

import { HOST_TIMEZONE, formatDateTimeInZone } from "@/lib/consulting/time";
import { useViewerTimezone } from "@/lib/consulting/useViewerTimezone";

/**
 * Shows a time in the VIEWER's timezone.
 *
 * Renders nothing on the server, on purpose: resolving the viewer's zone there
 * yields the deploy region's, so the server would emit one time and the browser
 * another and every render would hydrate mismatched.
 */
export default function LocalTimeEcho({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const [zone] = useViewerTimezone();

  if (!zone) return null;

  // Compare the RENDERED times, not the zone names. Browsers still report the
  // legacy alias "Asia/Calcutta" for IST, and a name check would show an
  // Indian visitor "that's 4:00 PM your time" under a line already saying
  // 4:00 PM. This also covers any other zone that happens to match right now.
  const local = formatDateTimeInZone(iso, zone);
  if (local === formatDateTimeInZone(iso, HOST_TIMEZONE)) return null;

  return (
    <span className={className}>
      That&apos;s {local} your time ({zone.replace(/_/g, " ")}).
    </span>
  );
}
