import EventForm from "@/components/admin/EventForm";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { createEvent } from "../actions";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";

export default function NewEventPage() {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Events", href: "/admin/events" }, { label: "New Event" }]}
      />
      <h1 className={ADMIN_H1_CLASS}>
        New Event
      </h1>
      <EventForm action={createEvent} />
    </div>
  );
}
