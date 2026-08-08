import Link from "next/link";
import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import { ADMIN_BUTTON_CLASS, ADMIN_H1_CLASS } from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import BrandsTable from "@/components/admin/tables/BrandsTable";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: true });

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? (brands ?? []).filter((b) =>
        `${b.handle} ${b.slug}`.toLowerCase().includes(query)
      )
    : (brands ?? []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={ADMIN_H1_CLASS}>Brands</h1>
        <Link href="/admin/brands/new" className={ADMIN_BUTTON_CLASS}>
          + New Brand
        </Link>
      </div>

      <div className="mt-4">
        <Suspense fallback={null}>
          <AdminSearchInput placeholder="Search by handle or slug..." />
        </Suspense>
      </div>

      <div className="mt-6">
        <BrandsTable
          brands={filtered}
          emptyMessage={query ? "No brands match your search." : "No brands yet."}
        />
      </div>
    </div>
  );
}
