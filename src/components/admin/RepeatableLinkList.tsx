"use client";

import { useState } from "react";
import { ADMIN_FOCUS_RING_CLASS } from "@/lib/admin/ui";

export type LinkValue = { label: string; url: string };

export default function RepeatableLinkList({
  labelName,
  urlName,
  label,
  defaultValues = [],
}: {
  labelName: string;
  urlName: string;
  /** Accessible name for each row, e.g. "Link" — rendered as "Link 1 label", "Link 1 URL"... */
  label: string;
  defaultValues?: LinkValue[];
}) {
  const [rows, setRows] = useState<{ id: number; value: LinkValue }[]>(
    defaultValues.length > 0
      ? defaultValues.map((value, i) => ({ id: i, value }))
      : [{ id: 0, value: { label: "", url: "" } }]
  );
  const [nextId, setNextId] = useState(rows.length);

  function updateRow(id: number, patch: Partial<LinkValue>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, value: { ...row.value, ...patch } } : row))
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={row.id} className="flex gap-2">
          <input
            name={labelName}
            value={row.value.label}
            onChange={(e) => updateRow(row.id, { label: e.target.value })}
            placeholder="Label (e.g. Instagram)"
            aria-label={`${label} ${i + 1} label`}
            className="flex-1 border-0 border-b border-black/15 bg-transparent px-0 py-2 text-sm text-black placeholder:text-black/40 focus:border-black focus:outline-none"
          />
          <input
            name={urlName}
            value={row.value.url}
            onChange={(e) => updateRow(row.id, { url: e.target.value })}
            placeholder="https://..."
            aria-label={`${label} ${i + 1} URL`}
            className="flex-1 border-0 border-b border-black/15 bg-transparent px-0 py-2 text-sm text-black placeholder:text-black/40 focus:border-black focus:outline-none"
          />
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
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
          setRows((prev) => [...prev, { id: nextId, value: { label: "", url: "" } }]);
          setNextId((n) => n + 1);
        }}
        className={`self-start rounded px-0.5 py-1 text-xs font-medium text-black/60 underline underline-offset-2 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
      >
        + Add {label.toLowerCase()}
      </button>
    </div>
  );
}
