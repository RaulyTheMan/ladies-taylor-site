"use client";

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "./focus";

type Features = typeof adminTableFeatures;

/**
 * The one table in the studio. Replaces the six hand-written tables that each
 * re-implemented head/row/cell markup against ADMIN_TABLE_* strings — callers
 * now supply column definitions and nothing else.
 *
 * TanStack stays headless: it supplies sort state and row order only, every
 * pixel is ours.
 */
export default function DataTable<T extends RowData>({
  data,
  columns,
  getRowId,
  empty,
  caption,
  className,
}: {
  data: T[];
  // Each caller's columns array mixes several per-column TValue types
  // (string, boolean, computed unions). TanStack's own columnHelper.columns()
  // return type uses this same `any` for that reason — a narrower type here
  // would lose per-column inference rather than gain safety.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Features, T, any>[];
  getRowId?: (row: T) => string;
  /** Rendered in place of the table body when there are no rows. */
  empty: React.ReactNode;
  /** Screen-reader description of what the table lists. */
  caption: string;
  className?: string;
}) {
  const table = useTable<Features, T>({
    features: adminTableFeatures,
    columns,
    data,
    getRowId,
  });

  if (data.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-admin-lg border border-admin-border",
        className
      )}
    >
      <table className="w-full border-collapse text-left text-[13px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-admin-surface">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    scope="col"
                    // Communicates sort state to assistive tech, which the
                    // previous tables' icon-only affordance never did.
                    aria-sort={
                      !canSort || !sorted
                        ? undefined
                        : sorted === "asc"
                          ? "ascending"
                          : "descending"
                    }
                    className="whitespace-nowrap border-b border-admin-border px-3 py-2 text-xs font-semibold text-admin-fg"
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-admin-sm text-admin-fg hover:text-admin-muted",
                          FOCUS_RING
                        )}
                      >
                        <table.FlexRender header={header} />
                        {sorted === "asc" ? (
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        ) : sorted === "desc" ? (
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ChevronsUpDown
                            className="h-3 w-3 opacity-30"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-admin-border last:border-0 hover:bg-admin-surface"
            >
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 align-middle">
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
