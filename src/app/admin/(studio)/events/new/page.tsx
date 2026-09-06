import PageHeader from "@/components/ui/PageHeader";
import EventForm from "@/components/studio/EventForm";
import { createEvent } from "../actions";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New event" />
      <EventForm action={createEvent} submitLabel="Create event" />
    </div>
  );
}
