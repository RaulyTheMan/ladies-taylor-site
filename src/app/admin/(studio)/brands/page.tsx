import Link from "next/link";
import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import StudioSearchInput from "@/components/studio/StudioSearchInput";
import BrandsTable from "@/components/studio/BrandsTable";

export const dynamic = "force-dynamic";

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();
  // Every seeded brand shares the same created_at, and ordering by a single
  // tied column leaves Postgres free to return rows in any order — the list
  // visibly reshuffled after each save. `slug` is unique, so it breaks the tie
  // deterministically.
  const { data: brands, error } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: true })
    .order("slug", { ascending: true });

  if (error) {
    console.error("[admin/brands] query failed:", error);
  }

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? (brands ?? []).filter((b) =>
        `${b.name ?? ""} ${b.handle} ${b.slug}`.toLowerCase().includes(query)
      )
    : (brands ?? []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Brands"
        description="Listed on the public Best of Bands page."
        actions={
          <Link href="/admin/brands/new" className={buttonClasses()}>
            New brand
          </Link>
        }
      />

      {error && (
        <div className="mt-4 rounded-admin-md border border-admin-danger/30 bg-admin-danger-surface px-3 py-2 text-[13px] text-admin-danger">
          Couldn&apos;t load brands — the database query failed. This list may be
          incomplete or empty even if brands exist. Check the server logs.
        </div>
      )}

      <div className="mt-4">
        <Suspense fallback={null}>
          <StudioSearchInput
            placeholder="Search by name, handle or slug..."
            className="max-w-xs"
          />
        </Suspense>
      </div>

      <div className="mt-3">
        <BrandsTable brands={filtered} filtered={Boolean(query)} />
      </div>
    </div>
  );
}
