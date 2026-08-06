import Link from "next/link";
import { Suspense } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_H1_CLASS,
  ADMIN_ICON_BUTTON_CLASS,
  ADMIN_ICON_BUTTON_DANGER_CLASS,
  ADMIN_TABLE_CELL_CLASS,
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_ROW_CLASS,
  ADMIN_TABLE_ROW_CLASS,
  ADMIN_TABLE_WRAPPER_CLASS,
  ADMIN_BADGE_CLASS,
} from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { deletePost } from "./actions";

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

      <div className={`mt-6 ${ADMIN_TABLE_WRAPPER_CLASS}`}>
        <table className={ADMIN_TABLE_CLASS}>
          <thead>
            <tr className={ADMIN_TABLE_HEAD_ROW_CLASS}>
              <th className={ADMIN_TABLE_CELL_CLASS}>Title</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Category</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Published</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Views</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Status</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className={`${ADMIN_TABLE_CELL_CLASS} font-medium text-black`}>
                  {post.title}
                  <p className="mt-0.5 text-xs text-black/60">/{post.slug}</p>
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {post.category}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {post.published_at ?? "TBD"}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {post.view_count.toLocaleString()}
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <div className="flex flex-wrap gap-1.5">
                    {!post.is_published && (
                      <span className={ADMIN_BADGE_CLASS}>Draft</span>
                    )}
                    {post.is_placeholder && (
                      <span className={ADMIN_BADGE_CLASS}>Placeholder</span>
                    )}
                    {post.is_published && !post.is_placeholder && (
                      <span className={ADMIN_BADGE_CLASS}>Published</span>
                    )}
                  </div>
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/press-media/${post.id}/edit`}
                      aria-label={`Edit "${post.title}"`}
                      className={ADMIN_ICON_BUTTON_CLASS}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deletePost(post.id, post.slug, post.title);
                      }}
                    >
                      <ConfirmSubmitButton
                        confirmTitle="Delete this post?"
                        confirmMessage={`"${post.title}" will be permanently removed, along with its public post page. This can't be undone.`}
                        className={ADMIN_ICON_BUTTON_DANGER_CLASS}
                        ariaLabel={`Delete "${post.title}"`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}
                >
                  {query ? "No posts match your search." : "No posts yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
