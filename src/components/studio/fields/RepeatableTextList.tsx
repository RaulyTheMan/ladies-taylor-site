"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "@/components/ui/focus";
import { controlClasses } from "@/components/ui/Field";
import Button, { IconButton } from "@/components/ui/Button";

/**
 * Studio-styled copy of components/admin/RepeatableTextList. The original is
 * left in place for the sections still on the old shell; both go when
 * (dashboard) is deleted.
 */
export default function RepeatableTextList({
  name,
  label,
  defaultValues = [],
  placeholder,
}: {
  name: string;
  /** Accessible name for each row — rendered as "Label 1", "Label 2"… */
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
          setRows((prev) => [...prev, { id: nextId, value: "" }]);
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
