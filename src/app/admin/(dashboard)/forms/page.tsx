import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import FormsQueryTable from "@/components/admin/tables/FormsQueryTable";
import { LEAD_STATUS_OPTIONS } from "@/lib/admin/leadStatus";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createSessionClient();

  const { data: submissions, error } = await supabase
    .from("august_query_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/forms] august_query_submissions query failed:", error);
  }

  const query = (q ?? "").trim().toLowerCase();
  const filtered = (submissions ?? []).filter((submission) => {
    const matchesQuery =
      !query ||
      `${submission.name} ${submission.email} ${submission.phone} ${submission.brand_name} ${submission.city}`
        .toLowerCase()
        .includes(query);
    const matchesStatus =
      !status || status === "all" || submission.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <h1 className={ADMIN_H1_CLASS}>Forms — August Query</h1>
      <p className="mt-1 text-sm text-black/60">
        Submissions from the /forms-august-query intake form.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Couldn&apos;t load submissions — the database query failed. This list
          may be incomplete or empty even if submissions exist. Check the server
          logs.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Suspense fallback={null}>
          <AdminSearchInput placeholder="Search by name, brand, email, or city..." />
        </Suspense>
        <StatusFilter current={status ?? "all"} />
      </div>

      <div className="mt-4">
        <FormsQueryTable
          submissions={filtered}
          emptyMessage={
            error
              ? "Unable to load submissions right now."
              : query || (status && status !== "all")
                ? "No submissions match your filters."
                : "No submissions yet."
          }
        />
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
