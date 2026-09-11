"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

// react-day-picker's stylesheet handles layout; these custom properties are its
// documented hook for recolouring. Black selection rather than lt-yellow: the
// accent is a fill behind the selected day's text, and yellow-on-white can't
// carry that (see globals.css and StudioDatePicker, which makes the same call).
const CALENDAR_STYLE = {
  "--rdp-accent-color": "#000",
  "--rdp-accent-background-color": "#f1f1f1",
  "--rdp-day-height": "40px",
  "--rdp-day-width": "40px",
} as React.CSSProperties;

export default function ConsultMonthGrid({
  month,
  onMonthChange,
  selected,
  onSelect,
  availableDays,
  maxDate,
  loading,
}: {
  month: Date;
  onMonthChange: (date: Date) => void;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  /** YYYY-MM-DD keys, in the viewer's chosen zone. */
  availableDays: Set<string>;
  maxDate: Date;
  loading: boolean;
}) {
  return (
    <div className="flex justify-center p-4 sm:p-5">
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={onMonthChange}
        selected={selected}
        onSelect={onSelect}
        showOutsideDays={false}
        startMonth={new Date()}
        endMonth={maxDate}
        // While a month is loading the PREVIOUS disabled set is kept rather than
        // enabling everything. A flash of "every day is free" reads as an
        // invitation and is worse than a brief stale grid.
        disabled={(date) => {
          const key = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
          ].join("-");
          return !availableDays.has(key);
        }}
        style={CALENDAR_STYLE}
        className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
      />
    </div>
  );
}
