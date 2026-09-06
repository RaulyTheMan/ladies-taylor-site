import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StudioSearchInput from "@/components/studio/StudioSearchInput";
import SubscribersTable from "@/components/studio/SubscribersTable";
import SubscribersExportButton from "@/components/studio/SubscribersExportButton";

export const dynamic = "force-dynamic";

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();

  // email is unique, so it breaks ties if two sign-ups share a timestamp.
  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .order("email", { ascending: true });

  if (error) {
    console.error("[admin/subscribers] query failed:", error);
  }

  const query = (q ?? "").trim().toLowerCase();
  const filtered = (subscribers ?? []).filter(
    (s) =>
      !query || `${s.email} ${s.source}`.toLowerCase().includes(query)
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Subscribers"
        description="Everyone who opted in through the website's newsletter form."
        actions={<SubscribersExportButton subscribers={filtered} />}
      />

      {error && (
        <div className="mt-4 rounded-admin-md border border-admin-danger/30 bg-admin-danger-surface px-3 py-2 text-[13px] text-admin-danger">
          Couldn&apos;t load subscribers — the database query failed. This list
          may be incomplete or empty even if subscribers exist. Check the server
          logs.
        </div>
      )}

      <div className="mt-4">
        <Suspense fallback={null}>
          <StudioSearchInput
            placeholder="Search by email or source..."
            className="max-w-xs"
          />
        </Suspense>
      </div>

      <div className="mt-3">
        <SubscribersTable subscribers={filtered} filtered={Boolean(query)} />
      </div>
    </div>
  );
}
