"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "@/components/ui/focus";
import { controlClasses } from "@/components/ui/Field";
import Button, { IconButton } from "@/components/ui/Button";

export type LinkValue = { label: string; url: string };

/** Studio-styled copy of components/admin/RepeatableLinkList. */
export default function RepeatableLinkList({
  labelName,
  urlName,
  label,
  defaultValues = [],
}: {
  labelName: string;
  urlName: string;
  /** Accessible name for each row — "Link 1 label", "Link 1 URL"… */
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
      prev.map((row) =>
        row.id === id ? { ...row, value: { ...row.value, ...patch } } : row
      )
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
            className={controlClasses(false, "h-8 flex-1 px-2.5")}
          />
          <input
            name={urlName}
            value={row.value.url}
            onChange={(e) => updateRow(row.id, { url: e.target.value })}
            placeholder="https://..."
            aria-label={`${label} ${i + 1} URL`}
            className={controlClasses(false, "h-8 flex-1 px-2.5")}
          />
          {rows.length > 1 && (
            <IconButton
              variant="ghost"
              onClick={() =>
                setRows((prev) => prev.filter((r) => r.id !== row.id))
              }
              aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
              className="text-admin-muted hover:text-admin-danger"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setRows((prev) => [
            ...prev,
            { id: nextId, value: { label: "", url: "" } },
          ]);
          setNextId((n) => n + 1);
        }}
        className={cn("self-start text-admin-muted", FOCUS_RING)}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add {label.toLowerCase()}
      </Button>
    </div>
  );
}
