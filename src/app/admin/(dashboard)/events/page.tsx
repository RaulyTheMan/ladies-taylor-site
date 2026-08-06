import Link from "next/link";
import { Suspense } from "react";
import { Pencil, Trash2, Users } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_H1_CLASS,
  ADMIN_ICON_BUTTON_CLASS,
  ADMIN_ICON_BUTTON_DANGER_CLASS,
  ADMIN_TABLE_CELL_CLASS,
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_ROW_CLASS,
  ADMIN_TABLE_ROW_CLASS,
  ADMIN_TABLE_WRAPPER_CLASS,
  ADMIN_BADGE_CLASS,
} from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { deleteEvent } from "./actions";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false });

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? (events ?? []).filter((e) =>
        `${e.title} ${e.slug}`.toLowerCase().includes(query)
      )
    : (events ?? []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={ADMIN_H1_CLASS}>Events</h1>
        <Link href="/admin/events/new" className={ADMIN_BUTTON_CLASS}>
          + New Event
        </Link>
      </div>

      <div className="mt-4">
        <Suspense fallback={null}>
          <AdminSearchInput placeholder="Search by title or slug..." />
        </Suspense>
      </div>

      <div className={`mt-6 ${ADMIN_TABLE_WRAPPER_CLASS}`}>
        <table className={ADMIN_TABLE_CLASS}>
          <thead>
            <tr className={ADMIN_TABLE_HEAD_ROW_CLASS}>
              <th className={ADMIN_TABLE_CELL_CLASS}>Title</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Date</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Date Published</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Status</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => (
              <tr key={event.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className={`${ADMIN_TABLE_CELL_CLASS} font-medium text-black`}>
                  {event.title}
                  <p className="mt-0.5 text-xs text-black/60">/{event.slug}</p>
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {event.event_date ?? "TBD"}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {event.published_at
                    ? new Date(event.published_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <div className="flex flex-wrap gap-1.5">
                    {!event.is_published && (
                      <span className={ADMIN_BADGE_CLASS}>Draft</span>
                    )}
                    {event.is_placeholder && (
                      <span className={ADMIN_BADGE_CLASS}>Placeholder</span>
                    )}
                    {event.is_published && !event.is_placeholder && (
                      <span className={ADMIN_BADGE_CLASS}>Published</span>
                    )}
                  </div>
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
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
                    <form
                      action={async () => {
                        "use server";
                        await deleteEvent(event.id, event.slug, event.title);
                      }}
                    >
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
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}
                >
                  {query ? "No events match your search." : "No events yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
