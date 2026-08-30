import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import LeadsContactsTable from "@/components/admin/tables/LeadsContactsTable";
import LeadsSubscribersTable from "@/components/admin/tables/LeadsSubscribersTable";
import { LEAD_STATUS_OPTIONS } from "@/lib/admin/leadStatus";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createSessionClient();

  const [
    { data: contacts, error: contactsError },
    { data: subscribers, error: subscribersError },
  ] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  if (contactsError) {
    console.error("[admin/leads] contact_submissions query failed:", contactsError);
  }
  if (subscribersError) {
    console.error("[admin/leads] newsletter_subscribers query failed:", subscribersError);
  }

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

        <div className="mt-4">
          <LeadsContactsTable
            contacts={filteredContacts}
            emptyMessage={
              query || (status && status !== "all")
                ? "No submissions match your filters."
                : "No submissions yet."
            }
          />
        </div>
      </div>

      <div>
        <h2 className={ADMIN_H1_CLASS}>Newsletter Subscribers</h2>
        <div className="mt-4">
          <LeadsSubscribersTable
            subscribers={subscribers ?? []}
            emptyMessage="No subscribers yet."
          />
        </div>
      </div>
    </div>
  );
}

function StatusFilter({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {[{ value: "all", label: "All" }, ...LEAD_STATUS_OPTIONS].map((option) => (
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
