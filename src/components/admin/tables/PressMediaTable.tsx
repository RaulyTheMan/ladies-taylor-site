"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import AdminSortableTable from "@/components/admin/AdminSortableTable";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import {
  ADMIN_ICON_BUTTON_CLASS,
  ADMIN_ICON_BUTTON_DANGER_CLASS,
  ADMIN_BADGE_CLASS,
} from "@/lib/admin/ui";
import type { Tables } from "@/lib/supabase/database.types";
import { deletePost } from "@/app/admin/(dashboard)/press-media/actions";

type PostRow = Tables<"blog_posts">;

const helper = createColumnHelper<typeof adminTableFeatures, PostRow>();

export default function PressMediaTable({
  posts,
  emptyMessage,
}: {
  posts: PostRow[];
  emptyMessage: string;
}) {
  const columns = useMemo(
    () => [
      helper.accessor("title", {
        header: "Title",
        cell: ({ row }) => (
          <>
            <span className="font-medium text-black">{row.original.title}</span>
            <p className="mt-0.5 text-xs text-black/60">/{row.original.slug}</p>
          </>
        ),
      }),
      helper.accessor("category", {
        header: "Category",
        cell: ({ row }) => (
          <span className="text-black/70">{row.original.category}</span>
        ),
      }),
      helper.accessor((row) => row.published_at ?? "", {
        id: "published_at",
        header: "Published",
        cell: ({ row }) => (
          <span className="text-black/70">{row.original.published_at ?? "TBD"}</span>
        ),
      }),
      helper.accessor("view_count", {
        header: "Views",
        cell: ({ row }) => (
          <span className="text-black/70">
            {row.original.view_count.toLocaleString()}
          </span>
        ),
      }),
      helper.accessor(
        (row) =>
          !row.is_published ? "Draft" : row.is_placeholder ? "Placeholder" : "Published",
        {
          id: "status",
          header: "Status",
          cell: ({ row }) => {
            const post = row.original;
            return (
              <div className="flex flex-wrap gap-1.5">
                {!post.is_published && <span className={ADMIN_BADGE_CLASS}>Draft</span>}
                {post.is_placeholder && (
                  <span className={ADMIN_BADGE_CLASS}>Placeholder</span>
                )}
                {post.is_published && !post.is_placeholder && (
                  <span className={ADMIN_BADGE_CLASS}>Published</span>
                )}
              </div>
            );
          },
        }
      ),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/admin/press-media/${post.id}/edit`}
                aria-label={`Edit "${post.title}"`}
                className={ADMIN_ICON_BUTTON_CLASS}
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <form action={deletePost.bind(null, post.id, post.slug, post.title)}>
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
          );
        },
      }),
    ],
    []
  );

  return (
    <AdminSortableTable
      data={posts}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage={emptyMessage}
    />
  );
}
