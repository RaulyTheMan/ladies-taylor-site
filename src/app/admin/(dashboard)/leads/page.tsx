import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import {
  ADMIN_H1_CLASS,
  ADMIN_INPUT_CLASS,
  ADMIN_TABLE_CELL_CLASS,
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_ROW_CLASS,
  ADMIN_TABLE_ROW_CLASS,
  ADMIN_TABLE_WRAPPER_CLASS,
} from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import { updateContactStatus } from "./actions";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createSessionClient();

  const [{ data: contacts }, { data: subscribers }] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const query = (q ?? "").trim().toLowerCase();
  const filteredContacts = (contacts ?? []).filter((contact) => {
    const matchesQuery =
      !query ||
      `${contact.name} ${contact.email} ${contact.phone}`
        .toLowerCase()
        .includes(query);
    const matchesStatus = !status || status === "all" || contact.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className={ADMIN_H1_CLASS}>Contact Submissions</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <AdminSearchInput placeholder="Search by name, email, or phone..." />
          </Suspense>
          <StatusFilter current={status ?? "all"} />
        </div>

        <div className={`mt-4 ${ADMIN_TABLE_WRAPPER_CLASS}`}>
          <table className={ADMIN_TABLE_CLASS}>
            <thead>
              <tr className={ADMIN_TABLE_HEAD_ROW_CLASS}>
                <th className={ADMIN_TABLE_CELL_CLASS}>Name</th>
                <th className={ADMIN_TABLE_CELL_CLASS}>Contact</th>
                <th className={ADMIN_TABLE_CELL_CLASS}>Received</th>
                <th className={ADMIN_TABLE_CELL_CLASS}>Notes</th>
                <th className={ADMIN_TABLE_CELL_CLASS}>Status</th>
                <th className={ADMIN_TABLE_CELL_CLASS}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className={ADMIN_TABLE_ROW_CLASS}>
                  <form action={updateContactStatus.bind(null, contact.id)} className="contents">
                    <td className={`${ADMIN_TABLE_CELL_CLASS} font-medium text-black`}>
                      {contact.name}
                    </td>
                    <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                      {contact.phone}
                      <br />
                      {contact.email}
                    </td>
                    <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}>
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className={ADMIN_TABLE_CELL_CLASS}>
                      <label htmlFor={`notes-${contact.id}`} className="sr-only">
                        Notes for {contact.name}
                      </label>
                      <input
                        id={`notes-${contact.id}`}
                        name="notes"
                        defaultValue={contact.notes ?? ""}
                        placeholder="Notes"
                        className={`${ADMIN_INPUT_CLASS} mt-0 w-40`}
                      />
                    </td>
                    <td className={ADMIN_TABLE_CELL_CLASS}>
                      <label htmlFor={`status-${contact.id}`} className="sr-only">
                        Status for {contact.name}
                      </label>
                      <select
                        id={`status-${contact.id}`}
                        name="status"
                        defaultValue={contact.status}
                        className={`${ADMIN_INPUT_CLASS} mt-0 w-32`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className={ADMIN_TABLE_CELL_CLASS}>
                      <button
                        type="submit"
                        className="rounded px-2 py-2 text-xs font-semibold text-black/70 underline hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      >
                        Save
                      </button>
                    </td>
                  </form>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}>
                    {query || (status && status !== "all")
                      ? "No submissions match your filters."
                      : "No submissions yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className={ADMIN_H1_CLASS}>Newsletter Subscribers</h2>
        <div className={`mt-4 ${ADMIN_TABLE_WRAPPER_CLASS}`}>
          <table className={ADMIN_TABLE_CLASS}>
            <thead>
              <tr className={ADMIN_TABLE_HEAD_ROW_CLASS}>
                <th className={ADMIN_TABLE_CELL_CLASS}>Email</th>
                <th className={ADMIN_TABLE_CELL_CLASS}>Source</th>
                <th className={ADMIN_TABLE_CELL_CLASS}>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {(subscribers ?? []).map((sub) => (
                <tr key={sub.id} className={ADMIN_TABLE_ROW_CLASS}>
                  <td className={`${ADMIN_TABLE_CELL_CLASS} font-medium text-black`}>
                    {sub.email}
                  </td>
                  <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                    {sub.source}
                  </td>
                  <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}>
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(subscribers ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}>
                    No subscribers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusFilter({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {[
        { value: "all", label: "All" },
        { value: "new", label: "New" },
        { value: "contacted", label: "Contacted" },
        { value: "closed", label: "Closed" },
      ].map((option) => (
        <a
          key={option.value}
          href={option.value === "all" ? "?" : `?status=${option.value}`}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
            current === option.value
              ? "bg-black text-white"
              : "bg-black/5 text-black/60 hover:bg-black/10"
          }`}
        >
          {option.label}
        </a>
      ))}
    </div>
  );
}
