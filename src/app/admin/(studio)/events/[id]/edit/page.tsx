import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import EventForm from "@/components/studio/EventForm";
import { updateEvent } from "../../actions";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSessionClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Edit ${event.title}`}
        actions={
          <Link
            href={`/admin/events/${event.id}/participants`}
            className={buttonClasses("secondary")}
          >
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            Participants
          </Link>
        }
      />
      <EventForm
        action={updateEvent.bind(null, id)}
        defaults={{
          slug: event.slug,
          title: event.title,
          eventDate: event.event_date ?? "",
          timeLabel: event.time_label ?? "",
          durationLabel: event.duration_label ?? "",
          location: event.location ?? "",
          priceInr: event.price_inr,
          hostName: event.host_name,
          hostRole: event.host_role,
          capacity: event.capacity,
          description: event.description,
          learnItems: event.learn_items,
          publishedAt: event.published_at?.slice(0, 10) ?? "",
          isPlaceholder: event.is_placeholder,
          isPublished: event.is_published,
          coverImageUrl: event.cover_image_url ?? undefined,
        }}
      />
    </div>
  );
}
