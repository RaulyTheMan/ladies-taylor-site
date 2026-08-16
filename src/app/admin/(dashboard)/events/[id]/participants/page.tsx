import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import {
  ADMIN_BADGE_CLASS,
  ADMIN_H1_CLASS,
  ADMIN_LINK_CLASS,
  ADMIN_LINK_DANGER_CLASS,
  ADMIN_TABLE_CELL_CLASS,
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_ROW_CLASS,
  ADMIN_TABLE_ROW_CLASS,
  ADMIN_TABLE_WRAPPER_CLASS,
} from "@/lib/admin/ui";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { updateRegistrationStatus, deleteRegistration } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  registered: "Registered",
  waiting: "Waiting",
  cancelled: "Cancelled",
};

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

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  const registeredCount =
    registrations?.filter((r) => r.status === "registered").length ?? 0;
  const waitingCount =
    registrations?.filter((r) => r.status === "waiting").length ?? 0;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/admin/events" },
          { label: event.title, href: `/admin/events/${event.id}/edit` },
          { label: "Participants" },
        ]}
      />
      <h1 className={ADMIN_H1_CLASS}>
        Participants — {event.title}
      </h1>
      <p className="mt-2 text-sm text-black/60">
        {registeredCount} registered
        {event.capacity != null ? ` / ${event.capacity} capacity` : ""} ·{" "}
        {waitingCount} waiting
      </p>

      <div className={`mt-6 ${ADMIN_TABLE_WRAPPER_CLASS}`}>
        <table className={ADMIN_TABLE_CLASS}>
          <thead>
            <tr className={ADMIN_TABLE_HEAD_ROW_CLASS}>
              <th className={ADMIN_TABLE_CELL_CLASS}>Name</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Contact</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Brand / Role</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Why</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Signed Up</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Status</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(registrations ?? []).map((reg) => (
              <tr key={reg.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className={`${ADMIN_TABLE_CELL_CLASS} font-medium text-black`}>
                  {reg.name}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {reg.phone}
                  <br />
                  {reg.email}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {reg.brand_name || reg.designation ? (
                    <>
                      {reg.brand_name}
                      {reg.brand_name && reg.designation && <br />}
                      {reg.designation}
                    </>
                  ) : (
                    <span className="text-black/40">—</span>
                  )}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} max-w-xs text-black/70`}>
                  {reg.reason ? (
                    <span className="line-clamp-3" title={reg.reason}>
                      {reg.reason}
                    </span>
                  ) : (
                    <span className="text-black/40">—</span>
                  )}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}>
                  {new Date(reg.created_at).toLocaleDateString()}
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <span className={ADMIN_BADGE_CLASS}>
                    {STATUS_LABEL[reg.status] ?? reg.status}
                  </span>
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <div className="flex items-center justify-end gap-4">
                    {reg.status === "waiting" && (
                      <form
                        action={updateRegistrationStatus.bind(
                          null,
                          reg.id,
                          event.slug,
                          "registered"
                        )}
                      >
                        <button type="submit" className={ADMIN_LINK_CLASS}>
                          Promote
                        </button>
                      </form>
                    )}
                    {reg.status !== "cancelled" && (
                      <form
                        action={updateRegistrationStatus.bind(
                          null,
                          reg.id,
                          event.slug,
                          "cancelled"
                        )}
                      >
                        <button type="submit" className={ADMIN_LINK_CLASS}>
                          Cancel
                        </button>
                      </form>
                    )}
                    <form
                      action={deleteRegistration.bind(null, reg.id, event.slug)}
                    >
                      <ConfirmSubmitButton
                        confirmTitle="Remove this sign-up?"
                        confirmMessage={`${reg.name}'s registration will be permanently removed. This can't be undone.`}
                        className={ADMIN_LINK_DANGER_CLASS}
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(registrations ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}>
                  No sign-ups yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
