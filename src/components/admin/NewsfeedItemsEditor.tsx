"use client";

import { useState } from "react";
import type { NewsfeedItem } from "@/components/desktop/window-content/NewsfeedContent";
import { ADMIN_FOCUS_RING_CLASS } from "@/lib/admin/ui";

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
          className="grid grid-cols-1 gap-2 rounded-md border border-black/10 bg-black/[0.02] p-3 sm:grid-cols-[1fr_2fr_1fr_auto]"
        >
          <input
            value={item.handle}
            onChange={(e) => update(item.key, { handle: e.target.value })}
            placeholder="@handle"
            aria-label={`Feed item ${i + 1} handle`}
            className={`rounded-md border border-black/15 bg-white px-2 py-1.5 text-xs text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15 ${ADMIN_FOCUS_RING_CLASS}`}
          />
          <input
            value={item.headline}
            onChange={(e) => update(item.key, { headline: e.target.value })}
            placeholder="Headline"
            aria-label={`Feed item ${i + 1} headline`}
            className={`rounded-md border border-black/15 bg-white px-2 py-1.5 text-xs text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15 ${ADMIN_FOCUS_RING_CLASS}`}
          />
          <input
            value={item.stat}
            onChange={(e) => update(item.key, { stat: e.target.value })}
            placeholder="100K Views | 204 Shares"
            aria-label={`Feed item ${i + 1} stat`}
            className={`rounded-md border border-black/15 bg-white px-2 py-1.5 text-xs text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15 ${ADMIN_FOCUS_RING_CLASS}`}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setItems((prev) => prev.filter((i) => i.key !== item.key))
              }
              aria-label={`Remove feed item ${i + 1}`}
              className={`rounded px-2 py-1 text-xs font-medium text-red-600 ${ADMIN_FOCUS_RING_CLASS}`}
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setItems((prev) => [
            ...prev,
            { key: Date.now(), handle: "", headline: "", stat: "" },
          ])
        }
        className={`self-start rounded px-0.5 py-1 text-xs font-medium text-black/60 underline underline-offset-2 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
      >
        + Add Item
      </button>
    </div>
  );
}
