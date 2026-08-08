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
  ADMIN_PILL_BADGE_CLASS,
} from "@/lib/admin/ui";
import type { Tables } from "@/lib/supabase/database.types";
import { deleteBrand } from "@/app/admin/(dashboard)/brands/actions";

type BrandRow = Tables<"brands">;

const helper = createColumnHelper<typeof adminTableFeatures, BrandRow>();

export default function BrandsTable({
  brands,
  emptyMessage,
}: {
  brands: BrandRow[];
  emptyMessage: string;
}) {
  const columns = useMemo(
    () => [
      helper.accessor((row) => row.name ?? "", {
        id: "name",
        header: "Name",
        cell: ({ row }) =>
          row.original.name || <span className="text-black/40">—</span>,
      }),
      helper.accessor("handle", {
        header: "Handle",
        cell: ({ row }) => (
          <>
            <span className={ADMIN_PILL_BADGE_CLASS}>@{row.original.handle}</span>
            <p className="mt-1 text-xs text-black/60">/{row.original.slug}</p>
          </>
        ),
      }),
      helper.accessor("industry_key", {
        header: "Industry",
        cell: ({ row }) => (
          <span className="text-black/70">{row.original.industry_key}</span>
        ),
      }),
      helper.accessor((row) => row.published_at ?? "", {
        id: "published_at",
        header: "Date Published",
        cell: ({ row }) => (
          <span className="text-black/70">
            {row.original.published_at
              ? new Date(row.original.published_at).toLocaleDateString()
              : "—"}
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
            const brand = row.original;
            return (
              <div className="flex flex-wrap gap-1.5">
                {!brand.is_published && <span className={ADMIN_BADGE_CLASS}>Draft</span>}
                {brand.is_placeholder && (
                  <span className={ADMIN_BADGE_CLASS}>Placeholder</span>
                )}
                {brand.is_published && !brand.is_placeholder && (
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
          const brand = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/admin/brands/${brand.id}/edit`}
                aria-label={`Edit @${brand.handle}`}
                className={ADMIN_ICON_BUTTON_CLASS}
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <form action={deleteBrand.bind(null, brand.id, brand.slug, brand.handle)}>
                <ConfirmSubmitButton
                  confirmTitle="Delete this brand?"
                  confirmMessage={`@${brand.handle} will be permanently removed, including its listing on the public Best of Bands page. This can't be undone.`}
                  className={ADMIN_ICON_BUTTON_DANGER_CLASS}
                  ariaLabel={`Delete @${brand.handle}`}
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
      data={brands}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage={emptyMessage}
    />
  );
}
