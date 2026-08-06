"use client";

import { useState } from "react";
import { ADMIN_FOCUS_RING_CLASS } from "@/lib/admin/ui";

export default function RepeatableTextList({
  name,
  label,
  defaultValues = [],
  placeholder,
}: {
  name: string;
  /** Accessible name for each row, e.g. "Instagram post permalink" — rendered as "Label 1", "Label 2"... for screen readers. */
  label: string;
  defaultValues?: string[];
  placeholder?: string;
}) {
  const [rows, setRows] = useState<{ id: number; value: string }[]>(
    defaultValues.length > 0
      ? defaultValues.map((value, i) => ({ id: i, value }))
      : [{ id: 0, value: "" }]
  );
  const [nextId, setNextId] = useState(rows.length);

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={row.id} className="flex gap-2">
          <input
            name={name}
            defaultValue={row.value}
            placeholder={placeholder}
            aria-label={`${label} ${i + 1}`}
            className="flex-1 border-0 border-b border-black/15 bg-transparent px-0 py-2 text-sm text-black placeholder:text-black/40 focus:border-black focus:outline-none"
          />
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setRows((prev) => prev.filter((r) => r.id !== row.id))
              }
              aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
              className={`rounded px-2 py-1 text-xs font-medium text-red-600 ${ADMIN_FOCUS_RING_CLASS}`}
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setRows((prev) => [...prev, { id: nextId, value: "" }]);
          setNextId((n) => n + 1);
        }}
        className={`self-start rounded px-0.5 py-1 text-xs font-medium text-black/60 underline underline-offset-2 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
      >
        + Add {label.toLowerCase()}
      </button>
    </div>
  );
}
