"use client";

import { formatTimeInZone } from "@/lib/consulting/time";

export type SlotState = "idle" | "loading" | "ready" | "error";

export default function ConsultSlotColumn({
  slots,
  state,
  timezone,
  selectedDay,
  onPick,
  onRetry,
  onNextMonth,
}: {
  slots: string[];
  state: SlotState;
  timezone: string;
  selectedDay: Date | undefined;
  onPick: (iso: string) => void;
  onRetry: () => void;
  onNextMonth: () => void;
}) {
  if (state === "error") {
    // Never a silent empty state. A blank column reads as "he has no
    // availability", which is a lie that costs a booking.
    return (
      <div className="p-4">
        <div className="comic-border-sm rounded-squircle-sm bg-lt-yellow p-3">
          <p className="text-sm font-semibold text-black">Couldn&apos;t load times.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-semibold text-black underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col gap-2 p-4" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading available times</span>
        {Array.from({ length: 6 }).map((_, i) => (
          // Flat blocks, no shimmer and no blur -- DESIGN.md's no-blur rule.
          <div key={i} className="h-9 rounded-squircle-xs bg-lt-gray" />
        ))}
      </div>
    );
  }

  if (!selectedDay) {
    return (
      <div className="p-4">
        <p className="text-sm text-black/50">Pick a date to see times.</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-black/60">Nothing open on this day.</p>
        <button
          type="button"
          onClick={onNextMonth}
          className="mt-2 text-sm font-semibold text-black underline underline-offset-2"
        >
          Try next month
        </button>
      </div>
    );
  }

  return (
    <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto p-4">
      {slots.map((iso) => (
        <button
          key={iso}
          type="button"
          onClick={() => onPick(iso)}
          className="comic-border-sm w-full rounded-squircle-xs bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-lt-yellow"
        >
          {formatTimeInZone(iso, timezone)}
        </button>
      ))}
    </div>
  );
}
