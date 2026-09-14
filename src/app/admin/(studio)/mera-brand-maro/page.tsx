import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StudioSearchInput from "@/components/studio/StudioSearchInput";
import MeraBrandMaroTable, {
  MeraBrandMaroExportButton,
} from "@/components/studio/MeraBrandMaroTable";

export const dynamic = "force-dynamic";

export default async function MeraBrandMaroPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();

  const { data: submissions, error } = await supabase
    .from("mera_brand_maro_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("[admin/mera-brand-maro] query failed:", error);
  }

  const query = (q ?? "").trim().toLowerCase();
  const filtered = (submissions ?? []).filter(
    (s) =>
      !query ||
      `${s.brand_name} ${s.name} ${s.email} ${s.phone}`.toLowerCase().includes(query)
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Mera Brand Maro"
        description="Free logo applications from /forms-mera-brand-maro. Click a brand to read the full answers."
        actions={<MeraBrandMaroExportButton submissions={filtered} />}
      />

      {error && (
        <div className="mt-4 rounded-admin-md border border-admin-danger/30 bg-admin-danger-surface px-3 py-2 text-[13px] text-admin-danger">
          Couldn&apos;t load submissions — the database query failed. This list
          may be incomplete or empty even if submissions exist. Check the server
          logs.
        </div>
      )}

      <div className="mt-4">
        <Suspense fallback={null}>
          <StudioSearchInput
            placeholder="Search by brand, name, email or number..."
            className="max-w-xs"
          />
        </Suspense>
      </div>

      <div className="mt-3">
        <MeraBrandMaroTable submissions={filtered} filtered={Boolean(query)} />
      </div>
    </div>
  );
}
