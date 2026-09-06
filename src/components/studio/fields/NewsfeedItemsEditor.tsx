"use client";

import { useState } from "react";
import type { NewsfeedItem } from "@/components/desktop/window-content/NewsfeedContent";
import { X, Plus } from "lucide-react";
import { controlClasses } from "@/components/ui/Field";
import Button, { IconButton } from "@/components/ui/Button";

type Draft = NewsfeedItem & { key: number };

export default function NewsfeedItemsEditor({
  name,
  defaultItems = [],
}: {
  name: string;
  defaultItems?: NewsfeedItem[];
}) {
  const [items, setItems] = useState<Draft[]>(
    defaultItems.length > 0
      ? defaultItems.map((item, i) => ({ ...item, key: i }))
      : [{ key: 0, handle: "", headline: "", stat: "" }]
  );

  function update(key: number, patch: Partial<NewsfeedItem>) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  }

  const serialized = JSON.stringify(
    items.map(({ handle, headline, stat }) => ({ handle, headline, stat }))
  );

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={serialized} />
      {items.map((item, i) => (
        <div
          key={item.key}
          className="grid grid-cols-1 gap-2 rounded-admin-md border border-admin-border bg-admin-surface p-3 sm:grid-cols-[1fr_2fr_1fr_auto]"
        >
          <input
            value={item.handle}
            onChange={(e) => update(item.key, { handle: e.target.value })}
            placeholder="@handle"
            aria-label={`Feed item ${i + 1} handle`}
            className={controlClasses(false, "h-8 px-2.5")}
          />
          <input
            value={item.headline}
            onChange={(e) => update(item.key, { headline: e.target.value })}
            placeholder="Headline"
            aria-label={`Feed item ${i + 1} headline`}
            className={controlClasses(false, "h-8 px-2.5")}
          />
          <input
            value={item.stat}
            onChange={(e) => update(item.key, { stat: e.target.value })}
            placeholder="100K Views | 204 Shares"
            aria-label={`Feed item ${i + 1} stat`}
            className={controlClasses(false, "h-8 px-2.5")}
          />
          {items.length > 1 && (
            <IconButton
              variant="ghost"
              onClick={() =>
                setItems((prev) => prev.filter((i) => i.key !== item.key))
              }
              aria-label={`Remove feed item ${i + 1}`}
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
        onClick={() =>
          setItems((prev) => [
            ...prev,
            { key: Date.now(), handle: "", headline: "", stat: "" },
          ])
        }
        className="self-start text-admin-muted"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add item
      </Button>
    </div>
  );
}
