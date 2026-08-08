import Link from "next/link";
import { Suspense } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import { ADMIN_BUTTON_CLASS, ADMIN_H1_CLASS } from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import PressMediaTable from "@/components/admin/tables/PressMediaTable";

export const dynamic = "force-dynamic";

export default async function AdminPressMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? (posts ?? []).filter((p) =>
        `${p.title} ${p.slug} ${p.category}`.toLowerCase().includes(query)
      )
    : (posts ?? []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={ADMIN_H1_CLASS}>Press &amp; Media</h1>
        <Link href="/admin/press-media/new" className={ADMIN_BUTTON_CLASS}>
          + New Post
        </Link>
      </div>

      <div className="mt-4">
        <Suspense fallback={null}>
          <AdminSearchInput placeholder="Search by title, slug, or category..." />
        </Suspense>
      </div>

      <div className="mt-6">
        <PressMediaTable
          posts={filtered}
          emptyMessage={query ? "No posts match your search." : "No posts yet."}
        />
      </div>
    </div>
  );
}
