import Link from "next/link";
import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import StudioSearchInput from "@/components/studio/StudioSearchInput";
import PressMediaTable from "@/components/studio/PressMediaTable";

export const dynamic = "force-dynamic";

export default async function PressMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();
  // slug breaks ties deterministically — unpublished posts all share a null
  // published_at and would otherwise come back in arbitrary order.
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("slug", { ascending: true });

  if (error) {
    console.error("[admin/press-media] query failed:", error);
  }

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? (posts ?? []).filter((p) =>
        `${p.title} ${p.slug} ${p.category}`.toLowerCase().includes(query)
      )
    : (posts ?? []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Press & Media"
        description="Posts on the public Press & Media page."
        actions={
          <Link href="/admin/press-media/new" className={buttonClasses()}>
            New post
          </Link>
        }
      />

      {error && (
        <div className="mt-4 rounded-admin-md border border-admin-danger/30 bg-admin-danger-surface px-3 py-2 text-[13px] text-admin-danger">
          Couldn&apos;t load posts — the database query failed. This list may be
          incomplete or empty even if posts exist. Check the server logs.
        </div>
      )}

      <div className="mt-4">
        <Suspense fallback={null}>
          <StudioSearchInput
            placeholder="Search by title, slug or category..."
            className="max-w-xs"
          />
        </Suspense>
      </div>

      <div className="mt-3">
        <PressMediaTable posts={filtered} filtered={Boolean(query)} />
      </div>
    </div>
  );
}
