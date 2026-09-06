"use client";

import { Download } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Tables } from "@/lib/supabase/database.types";

type SubscriberRow = Tables<"newsletter_subscribers">;

/** RFC 4180 quoting — doubles embedded quotes and wraps every field, so a
 *  comma or newline inside a source label can't shift the columns. */
function csvCell(value: string | null): string {
  return `"${(value ?? "").replace(/"/g, '""')}"`;
}

function toCsv(subscribers: SubscriberRow[]): string {
  const rows = [
    ["Email", "Source", "Subscribed"],
    ...subscribers.map((s) => [
      s.email,
      s.source,
      new Date(s.created_at).toISOString(),
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export default function SubscribersExportButton({
  subscribers,
}: {
  subscribers: SubscriberRow[];
}) {
  const download = () => {
    const blob = new Blob([toCsv(subscribers)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="secondary"
      onClick={download}
      disabled={subscribers.length === 0}
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      Export CSV
      {subscribers.length > 0 && ` (${subscribers.length})`}
    </Button>
  );
}
