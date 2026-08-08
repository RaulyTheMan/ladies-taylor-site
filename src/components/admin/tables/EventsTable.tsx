"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pencil, Trash2, Users } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import AdminSortableTable from "@/components/admin/AdminSortableTable";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import {
  ADMIN_ICON_BUTTON_CLASS,
  ADMIN_ICON_BUTTON_DANGER_CLASS,
  ADMIN_BADGE_CLASS,
} from "@/lib/admin/ui";
import type { Tables } from "@/lib/supabase/database.types";
import { deleteEvent } from "@/app/admin/(dashboard)/events/actions";

type EventRow = Tables<"events">;

const helper = createColumnHelper<typeof adminTableFeatures, EventRow>();

export default function EventsTable({
  events,
  emptyMessage,
}: {
  events: EventRow[];
  emptyMessage: string;
}) {
  const columns = useMemo(
    () => [
      helper.accessor("title", {
        header: "Title",
        cell: ({ row }) => (
          <>
            <span className="font-medium text-black">{row.original.title}</span>
            <p className="mt-0.5 text-xs text-black/60">/{row.original.slug}</p>
          </>
        ),
      }),
      helper.accessor((row) => row.event_date ?? "", {
        id: "event_date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-black/70">{row.original.event_date ?? "TBD"}</span>
        ),
      }),
      helper.accessor((row) => row.published_at ?? "", {
        id: "published_at",
        header: "Date Published",
        cell: ({ row }) => (
          <span className="text-black/70">
            {row.original.published_at
              ? new Date(row.original.published_at).toLocaleDateString()
              : "—"}
          </span>
        ),
      }),
      helper.accessor(
        (row) =>
          !row.is_published ? "Draft" : row.is_placeholder ? "Placeholder" : "Published",
        {
          id: "status",
          header: "Status",
          cell: ({ row }) => {
            const event = row.original;
            return (
              <div className="flex flex-wrap gap-1.5">
                {!event.is_published && <span className={ADMIN_BADGE_CLASS}>Draft</span>}
                {event.is_placeholder && (
                  <span className={ADMIN_BADGE_CLASS}>Placeholder</span>
                )}
                {event.is_published && !event.is_placeholder && (
                  <span className={ADMIN_BADGE_CLASS}>Published</span>
                )}
              </div>
            );
          },
        }
      ),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const event = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/admin/events/${event.id}/participants`}
                aria-label={`Participants for "${event.title}"`}
                className={ADMIN_ICON_BUTTON_CLASS}
              >
                <Users className="h-4 w-4" />
              </Link>
              <Link
                href={`/admin/events/${event.id}/edit`}
                aria-label={`Edit "${event.title}"`}
                className={ADMIN_ICON_BUTTON_CLASS}
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <form action={deleteEvent.bind(null, event.id, event.slug, event.title)}>
                <ConfirmSubmitButton
                  confirmTitle="Delete this event?"
                  confirmMessage={`"${event.title}" will be permanently removed, along with its public event page. This can't be undone.`}
                  className={ADMIN_ICON_BUTTON_DANGER_CLASS}
                  ariaLabel={`Delete "${event.title}"`}
                >
                  <Trash2 className="h-4 w-4" />
                </ConfirmSubmitButton>
              </form>
            </div>
          );
        },
      }),
    ],
    []
  );

  return (
    <AdminSortableTable
      data={events}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage={emptyMessage}
    />
  );
}
