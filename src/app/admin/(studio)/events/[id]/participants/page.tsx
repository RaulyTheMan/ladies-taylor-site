import { notFound } from "next/navigation";
import Link from "next/link";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import ParticipantsTable from "@/components/studio/ParticipantsTable";

export const dynamic = "force-dynamic";

export default async function EventParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSessionClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, slug, title, capacity")
    .eq("id", id)
    .maybeSingle();

  if (!event) {
    notFound();
  }

  const { data: registrations, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admin/events/participants] query failed:", error);
  }

  const rows = registrations ?? [];
  const registeredCount = rows.filter((r) => r.status === "registered").length;
  const waitingCount = rows.filter((r) => r.status === "waiting").length;
  const cancelledCount = rows.filter((r) => r.status === "cancelled").length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Participants — ${event.title}`}
        actions={
          <Link
            href={`/admin/events/${event.id}/edit`}
            className={buttonClasses("secondary")}
          >
            Edit event
          </Link>
        }
      />

      {error && (
        <div className="mt-4 rounded-admin-md border border-admin-danger/30 bg-admin-danger-surface px-3 py-2 text-[13px] text-admin-danger">
          Couldn&apos;t load sign-ups — the database query failed. This list may
          be incomplete or empty even if people have registered. Check the
          server logs.
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat
          label={event.capacity != null ? `Registered of ${event.capacity}` : "Registered"}
          value={registeredCount}
        />
        <Stat label="Waiting" value={waitingCount} />
        <Stat label="Cancelled" value={cancelledCount} />
      </div>

      <div className="mt-3">
        <ParticipantsTable registrations={rows} eventSlug={event.slug} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-semibold tabular-nums text-admin-fg">{value}</p>
      <Text muted size="sm" className="mt-0.5">
        {label}
      </Text>
    </Card>
  );
}
