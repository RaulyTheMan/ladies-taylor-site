"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pencil, Trash2, Newspaper } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/Card";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { formatDate } from "@/lib/ui/formatDate";
import type { Tables } from "@/lib/supabase/database.types";
import { deletePost } from "@/app/admin/(studio)/press-media/actions";

type PostRow = Tables<"blog_posts">;

const helper = createColumnHelper<typeof adminTableFeatures, PostRow>();

export default function PressMediaTable({
  posts,
  filtered,
}: {
  posts: PostRow[];
  filtered: boolean;
}) {
  const columns = useMemo(
    () => [
      helper.accessor("title", {
        header: "Title",
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-admin-fg">
              {row.original.title}
            </span>
            <p className="text-xs text-admin-muted">/{row.original.slug}</p>
          </div>
        ),
      }),
      helper.accessor("category", {
        header: "Category",
        cell: ({ row }) => (
          <span className="text-admin-muted">{row.original.category}</span>
        ),
      }),
      helper.accessor((row) => row.published_at ?? "", {
        id: "published_at",
        header: "Published",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-admin-muted">
            {row.original.published_at
              ? formatDate(row.original.published_at)
              : "TBD"}
          </span>
        ),
      }),
      helper.accessor("view_count", {
        header: "Views",
        cell: ({ row }) => (
          <span className="tabular-nums text-admin-muted">
            {row.original.view_count.toLocaleString("en-GB")}
          </span>
        ),
      }),
      helper.accessor(
        (row) =>
          !row.is_published
            ? "Draft"
            : row.is_placeholder
              ? "Placeholder"
              : "Published",
        {
          id: "status",
          header: "Status",
          cell: ({ row }) => {
            const post = row.original;
            return (
              <div className="flex flex-wrap gap-1">
                {!post.is_published && <Badge variant="outline">Draft</Badge>}
                {post.is_placeholder && (
                  <Badge variant="accent">Placeholder</Badge>
                )}
                {post.is_published && !post.is_placeholder && (
                  <Badge>Published</Badge>
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
                className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <form
                action={deletePost.bind(null, post.id, post.slug, post.title)}
              >
                <ConfirmButton
                  confirmTitle="Delete this post?"
                  confirmMessage={`"${post.title}" will be permanently removed, along with its public post page. This can't be undone.`}
                  ariaLabel={`Delete "${post.title}"`}
                  className={buttonClasses(
                    "ghost",
                    "sm",
                    "w-[26px] px-0 text-admin-muted hover:bg-admin-danger-surface hover:text-admin-danger"
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </ConfirmButton>
              </form>
            </div>
          );
        },
      }),
    ],
    []
  );

  return (
    <DataTable
      data={posts}
      columns={columns}
      getRowId={(row) => row.id}
      caption="Posts listed on the public Press & Media page"
      empty={
        filtered ? (
          <EmptyState
            icon={Newspaper}
            title="No posts match your search"
            description="Try a different title, slug or category."
          />
        ) : (
          <EmptyState
            icon={Newspaper}
            title="No posts yet"
            description="Posts you write here appear on the public Press & Media page."
            action={
              <Link href="/admin/press-media/new" className={buttonClasses()}>
                New post
              </Link>
            }
          />
        )
      }
    />
  );
}
