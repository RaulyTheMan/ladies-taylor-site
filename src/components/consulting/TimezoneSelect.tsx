"use client";

import { zoneAbbreviation } from "@/lib/consulting/time";

// A curated shortlist, not Intl.supportedValuesOf('timeZone') -- that returns
// roughly 400 entries and a select of 400 options is hostile. The viewer's own
// zone is added at the top when it isn't already here, so nobody is stranded.
const COMMON_ZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
];

export default function TimezoneSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (zone: string) => void;
}) {
  const zones = COMMON_ZONES.includes(value) ? COMMON_ZONES : [value, ...COMMON_ZONES];

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-black/50">
        Times shown in
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-squircle-xs border border-black/15 bg-black/[0.06] px-2.5 py-2 text-sm text-black outline-none transition-colors focus:border-black focus:bg-white"
      >
        {zones.map((zone) => (
          <option key={zone} value={zone}>
            {zone.replace(/_/g, " ")} ({zoneAbbreviation(zone)})
          </option>
        ))}
      </select>
    </label>
  );
}
