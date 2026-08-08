"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { ADMIN_CARD_CLASS, ADMIN_INPUT_CLASS } from "@/lib/admin/ui";

// react-day-picker's own base stylesheet (imported above) handles layout;
// these two CSS custom properties are its documented hook for recoloring
// the selected/accent state, so this is the only styling needed to match
// the admin panel's orange accent instead of the library's default blue.
const CALENDAR_STYLE = {
  "--rdp-accent-color": "var(--color-orange-500, #f97316)",
  "--rdp-accent-background-color": "var(--color-orange-100, #ffedd5)",
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

export default function AdminDatePicker({
  id,
  name,
  defaultValue = "",
  placeholder = "Select a date",
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
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
      {/* The visible control is a plain button, not an input — the real
          form value travels via this hidden input so the existing
          `formData.get(name)` server actions need no changes. */}
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        className={`${ADMIN_INPUT_CLASS} flex items-center justify-between text-left`}
      >
        <span className={value ? "text-black" : "text-black/40"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-modal="false"
          className={`${ADMIN_CARD_CLASS} absolute left-0 top-full z-20 mt-2 p-3`}
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
              className="mt-1 w-full rounded-md py-1.5 text-xs font-semibold text-black/60 transition-colors hover:bg-black/5 hover:text-black"
            >
              Clear (leave as TBD)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
