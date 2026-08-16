"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FilterOption = { key: string; label: string };

// Black rounded-pill dropdown used for the Best of Brands filter row
// (Category / Collection / Year Added). The pill keeps its static label at
// rest and shows the active value only once it's narrowed from "All".
export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = options.find((opt) => opt.key === value);
  const showValue = value !== "all" && active;

  return (
    <div
      className="relative inline-block"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={label}
        className="flex items-center gap-2 rounded-full bg-lt-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
      >
        {showValue ? active.label : label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 max-h-72 w-52 overflow-y-auto rounded-squircle-md border-2 border-black bg-white">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                value === opt.key
                  ? "bg-lt-dark text-white"
                  : "text-black hover:bg-black/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
