"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pencil, Trash2, Users, CalendarDays } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/Card";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { formatDate } from "@/lib/ui/formatDate";
import type { Tables } from "@/lib/supabase/database.types";
import { deleteEvent } from "@/app/admin/(studio)/events/actions";

type EventRow = Tables<"events">;

const helper = createColumnHelper<typeof adminTableFeatures, EventRow>();

export default function EventsTable({
  events,
  filtered,
}: {
  events: EventRow[];
  filtered: boolean;
}) {
  const columns = useMemo(
    () => [
      helper.accessor("title", {
        header: "Title",
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-admin-fg">
              {row.original.title}
            </span>
            <p className="text-xs text-admin-muted">/{row.original.slug}</p>
          </div>
        ),
      }),
      helper.accessor((row) => row.event_date ?? "", {
        id: "event_date",
        header: "Event date",
        cell: ({ row }) => (
          <span className="text-admin-muted">
            {row.original.event_date ? formatDate(row.original.event_date) : "TBD"}
          </span>
        ),
      }),
      helper.accessor((row) => row.published_at ?? "", {
        id: "published_at",
        header: "Published",
        cell: ({ row }) => (
          <span className="text-admin-muted">
            {formatDate(row.original.published_at)}
          </span>
        ),
      }),
      helper.accessor(
        (row) =>
          !row.is_published
            ? "Draft"
            : row.is_placeholder
              ? "Placeholder"
              : "Published",
        {
          id: "status",
          header: "Status",
          cell: ({ row }) => {
            const event = row.original;
            return (
              <div className="flex flex-wrap gap-1">
                {!event.is_published && <Badge variant="outline">Draft</Badge>}
                {event.is_placeholder && (
                  <Badge variant="accent">Placeholder</Badge>
                )}
                {event.is_published && !event.is_placeholder && (
                  <Badge>Published</Badge>
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
                className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
              >
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href={`/admin/events/${event.id}/edit`}
                aria-label={`Edit "${event.title}"`}
                className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <form
                action={deleteEvent.bind(
                  null,
                  event.id,
                  event.slug,
                  event.title
                )}
              >
                <ConfirmButton
                  confirmTitle="Delete this event?"
                  confirmMessage={`"${event.title}" will be permanently removed, along with its public event page and every registration on it. This can't be undone.`}
                  ariaLabel={`Delete "${event.title}"`}
                  className={buttonClasses(
                    "ghost",
                    "sm",
                    "w-[26px] px-0 text-admin-muted hover:bg-admin-danger-surface hover:text-admin-danger"
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </ConfirmButton>
              </form>
            </div>
          );
        },
      }),
    ],
    []
  );

  return (
    <DataTable
      data={events}
      columns={columns}
      getRowId={(row) => row.id}
      caption="Events listed on the public events page"
      empty={
        filtered ? (
          <EmptyState
            icon={CalendarDays}
            title="No events match your search"
            description="Try a different title or slug."
          />
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            description="Events you add here appear on the public events page."
            action={
              <Link href="/admin/events/new" className={buttonClasses()}>
                New event
              </Link>
            }
          />
        )
      }
    />
  );
}
