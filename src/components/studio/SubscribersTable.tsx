"use client";

import { useMemo } from "react";
import { Mail } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Card";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { formatDate } from "@/lib/ui/formatDate";
import type { Tables } from "@/lib/supabase/database.types";

type SubscriberRow = Tables<"newsletter_subscribers">;

const helper = createColumnHelper<typeof adminTableFeatures, SubscriberRow>();

export default function SubscribersTable({
  subscribers,
  filtered,
}: {
  subscribers: SubscriberRow[];
  filtered: boolean;
}) {
  const columns = useMemo(
    () => [
      helper.accessor("email", {
        header: "Email",
        cell: ({ row }) => (
          <a
            href={`mailto:${row.original.email}`}
            className="font-medium text-admin-fg underline decoration-admin-border-strong underline-offset-2 hover:decoration-admin-fg"
          >
            {row.original.email}
          </a>
        ),
      }),
      helper.accessor("source", {
        header: "Source",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.source}</Badge>
        ),
      }),
      helper.accessor("created_at", {
        header: "Subscribed",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-admin-muted">
            {formatDate(row.original.created_at)}
          </span>
        ),
      }),
    ],
    []
  );

  return (
    <DataTable
      data={subscribers}
      columns={columns}
      getRowId={(row) => row.id}
      caption="People who opted in through the website's newsletter form"
      empty={
        filtered ? (
          <EmptyState
            icon={Mail}
            title="No subscribers match your search"
            description="Try a different email or source."
          />
        ) : (
          <EmptyState
            icon={Mail}
            title="No subscribers yet"
            description="Sign-ups from the website's newsletter form appear here."
          />
        )
      }
    />
  );
}
