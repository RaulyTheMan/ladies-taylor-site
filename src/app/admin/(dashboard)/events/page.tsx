import Link from "next/link";
import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import { ADMIN_BUTTON_CLASS, ADMIN_H1_CLASS } from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import EventsTable from "@/components/admin/tables/EventsTable";

export const dynamic = "force-dynamic";

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

      <div className="mt-6">
        <EventsTable
          events={filtered}
          emptyMessage={query ? "No events match your search." : "No events yet."}
        />
      </div>
    </div>
  );
}
