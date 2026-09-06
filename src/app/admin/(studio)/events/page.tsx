import Link from "next/link";
import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import StudioSearchInput from "@/components/studio/StudioSearchInput";
import EventsTable from "@/components/studio/EventsTable";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();
  // slug breaks ties deterministically — events sharing an event_date (or all
  // having none) would otherwise come back in arbitrary order and the list
  // would reshuffle between loads.
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("slug", { ascending: true });

  if (error) {
    console.error("[admin/events] query failed:", error);
  }

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? (events ?? []).filter((e) =>
        `${e.title} ${e.slug}`.toLowerCase().includes(query)
      )
    : (events ?? []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Events"
        description="Listed on the public events page."
        actions={
          <Link href="/admin/events/new" className={buttonClasses()}>
            New event
          </Link>
        }
      />

      {error && (
        <div className="mt-4 rounded-admin-md border border-admin-danger/30 bg-admin-danger-surface px-3 py-2 text-[13px] text-admin-danger">
          Couldn&apos;t load events — the database query failed. This list may be
          incomplete or empty even if events exist. Check the server logs.
        </div>
      )}

      <div className="mt-4">
        <Suspense fallback={null}>
          <StudioSearchInput
            placeholder="Search by title or slug..."
            className="max-w-xs"
          />
        </Suspense>
      </div>

      <div className="mt-3">
        <EventsTable events={filtered} filtered={Boolean(query)} />
      </div>
    </div>
  );
}
