"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pencil, Trash2, Tags } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/Card";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { formatDate } from "@/lib/ui/formatDate";
import type { Tables } from "@/lib/supabase/database.types";
import { deleteBrand } from "@/app/admin/(studio)/brands/actions";

type BrandRow = Tables<"brands">;

const helper = createColumnHelper<typeof adminTableFeatures, BrandRow>();

export default function BrandsTable({
  brands,
  filtered,
}: {
  brands: BrandRow[];
  /** Whether a search is narrowing the list — changes the empty copy. */
  filtered: boolean;
}) {
  const columns = useMemo(
    () => [
      helper.accessor((row) => row.name ?? "", {
        id: "name",
        header: "Name",
        cell: ({ row }) =>
          row.original.name || (
            <span className="text-admin-muted">—</span>
          ),
      }),
      helper.accessor("handle", {
        header: "Handle",
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-admin-fg">
              @{row.original.handle}
            </span>
            <p className="text-xs text-admin-muted">/{row.original.slug}</p>
          </div>
        ),
      }),
      helper.accessor("industry_key", {
        header: "Industry",
        cell: ({ row }) => (
          <span className="text-admin-muted">{row.original.industry_key}</span>
        ),
      }),
      helper.accessor((row) => row.published_at ?? "", {
        id: "published_at",
        header: "Published",
        cell: ({ row }) => (
          <span className="text-admin-muted">
            {formatDate(row.original.published_at)}
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
            const brand = row.original;
            return (
              <div className="flex flex-wrap gap-1">
                {!brand.is_published && <Badge variant="outline">Draft</Badge>}
                {brand.is_placeholder && (
                  <Badge variant="accent">Placeholder</Badge>
                )}
                {brand.is_published && !brand.is_placeholder && (
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
          const brand = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/admin/brands/${brand.id}/edit`}
                aria-label={`Edit @${brand.handle}`}
                className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <form
                action={deleteBrand.bind(
                  null,
                  brand.id,
                  brand.slug,
                  brand.handle
                )}
              >
                <ConfirmButton
                  confirmTitle="Delete this brand?"
                  confirmMessage={`@${brand.handle} will be permanently removed, including its listing on the public Best of Bands page. This can't be undone.`}
                  ariaLabel={`Delete @${brand.handle}`}
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
      data={brands}
      columns={columns}
      getRowId={(row) => row.id}
      caption="Brands listed on the public Best of Bands page"
      empty={
        filtered ? (
          <EmptyState
            icon={Tags}
            title="No brands match your search"
            description="Try a different handle or slug."
          />
        ) : (
          <EmptyState
            icon={Tags}
            title="No brands yet"
            description="Brands you add here appear on the public Best of Bands page."
            action={
              <Link href="/admin/brands/new" className={buttonClasses()}>
                New brand
              </Link>
            }
          />
        )
      }
    />
  );
}
