import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import EventForm from "@/components/admin/EventForm";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { updateEvent } from "../../actions";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";

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
    <div>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/admin/events" },
          { label: event.title },
        ]}
      />
      <h1 className={ADMIN_H1_CLASS}>
        Edit Event
      </h1>
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
