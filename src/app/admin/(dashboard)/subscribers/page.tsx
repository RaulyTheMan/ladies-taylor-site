import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import SubscribersTable from "@/components/admin/tables/SubscribersTable";
import SubscribersExportButton from "@/components/admin/SubscribersExportButton";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();

  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/subscribers] query failed:", error);
  }

  const query = (q ?? "").trim().toLowerCase();
  const filtered = (subscribers ?? []).filter(
    (subscriber) =>
      !query || `${subscriber.email} ${subscriber.source}`.toLowerCase().includes(query)
  );

  return (
    <div>
      <h1 className={ADMIN_H1_CLASS}>Newsletter Subscribers</h1>
      <p className="mt-1 text-sm text-black/60">
        Everyone who opted in through the website&apos;s newsletter form.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Couldn&apos;t load subscribers — the database query failed. This list
          may be incomplete or empty even if subscribers exist. Check the server
          logs.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Suspense fallback={null}>
          <AdminSearchInput placeholder="Search by email or source..." />
        </Suspense>
        <SubscribersExportButton subscribers={filtered} />
      </div>

      <div className="mt-4">
        <SubscribersTable
          subscribers={filtered}
          emptyMessage={query ? "No subscribers match your search." : "No subscribers yet."}
        />
      </div>
    </div>
  );
}
