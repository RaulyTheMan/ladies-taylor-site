"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { controlClasses } from "@/components/ui/Field";

// react-day-picker's own base stylesheet (imported above) handles layout;
// these custom properties are its documented hook for recolouring the
// selected/accent state. Black rather than the studio's yellow: the accent
// is a fill behind the selected day's text, and yellow-on-white cannot
// carry that on its own (see globals.css).
const CALENDAR_STYLE = {
  "--rdp-accent-color": "var(--color-admin-fg)",
  "--rdp-accent-background-color": "var(--color-admin-surface-hover)",
} as React.CSSProperties;

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODate(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDisplay(value: string): string {
  const date = parseISODate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Studio-styled copy of components/admin/AdminDatePicker. */
export default function StudioDatePicker({
  id,
  name,
  defaultValue = "",
  placeholder = "Select a date",
  describedBy,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  describedBy?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selected = parseISODate(value);

  return (
    <div ref={containerRef} className="relative">
      {/* The visible control is a button, not an input — the real form value
          travels via this hidden input so the existing formData.get(name)
          server actions need no changes. */}
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-describedby={describedBy}
        className={controlClasses(
          false,
          "flex h-8 items-center justify-between gap-2 px-2.5 text-left"
        )}
      >
        <span className={value ? "text-admin-fg" : "text-admin-muted"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarDays
          className="h-3.5 w-3.5 shrink-0 text-admin-muted"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-modal="false"
          className={cn(
            "absolute left-0 top-full z-20 mt-1 rounded-admin-lg border border-admin-border bg-admin-bg p-3 shadow-lg"
          )}
        >
          <DayPicker
            mode="single"
            autoFocus
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              setValue(date ? toISODate(date) : "");
              setOpen(false);
            }}
            style={CALENDAR_STYLE}
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
              className="mt-1 w-full rounded-admin-md py-1.5 text-xs font-medium text-admin-muted transition-colors hover:bg-admin-surface-hover hover:text-admin-fg"
            >
              Clear (leave as TBD)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
