"use client";

import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import AdminSortableTable from "@/components/admin/AdminSortableTable";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import type { Tables } from "@/lib/supabase/database.types";

type SubscriberRow = Tables<"newsletter_subscribers">;

const helper = createColumnHelper<typeof adminTableFeatures, SubscriberRow>();

export default function LeadsSubscribersTable({
  subscribers,
  emptyMessage,
}: {
  subscribers: SubscriberRow[];
  emptyMessage: string;
}) {
  const columns = useMemo(
    () => [
      helper.accessor("email", {
        header: "Email",
        cell: ({ row }) => (
          <span className="font-medium text-black">{row.original.email}</span>
        ),
      }),
      helper.accessor("source", {
        header: "Source",
        cell: ({ row }) => (
          <span className="text-black/70">{row.original.source}</span>
        ),
      }),
      helper.accessor("created_at", {
        header: "Subscribed",
        cell: ({ row }) => (
          <span className="text-black/60">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      }),
    ],
    []
  );

  return (
    <AdminSortableTable
      data={subscribers}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage={emptyMessage}
    />
  );
}
