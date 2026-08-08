"use client";

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import {
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_ROW_CLASS,
  ADMIN_TABLE_ROW_CLASS,
  ADMIN_TABLE_CELL_CLASS,
  ADMIN_TABLE_WRAPPER_CLASS,
} from "@/lib/admin/ui";

type Features = typeof adminTableFeatures;

// Headless — TanStack Table only supplies sort state/row order, every cell
// still renders with the existing ADMIN_TABLE_* tokens, so this adds real
// column sorting (there was none anywhere in the admin before) without
// introducing a second visual system.
export default function AdminSortableTable<T extends RowData>({
  data,
  columns,
  getRowId,
  emptyMessage,
}: {
  data: T[];
  // Each caller's columns array mixes several different per-column TValue
  // types (string, boolean, computed unions, ...) — TanStack's own
  // `columnHelper.columns()` return type uses this same `any` for that
  // reason (`Array<ColumnDef<TFeatures, TData, any>>`), it's not something
  // a narrower type here could avoid without losing per-column inference.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Features, T, any>[];
  getRowId?: (row: T) => string;
  emptyMessage: string;
}) {
  const table = useTable<Features, T>({
    features: adminTableFeatures,
    columns,
    data,
    getRowId,
  });

  return (
    <div className={ADMIN_TABLE_WRAPPER_CLASS}>
      <table className={ADMIN_TABLE_CLASS}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={ADMIN_TABLE_HEAD_ROW_CLASS}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                return (
                  <th key={header.id} className={ADMIN_TABLE_CELL_CLASS}>
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 text-black transition-colors hover:text-black/60"
                      >
                        <table.FlexRender header={header} />
                        {sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : sortDir === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
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
            <tr key={row.id} className={ADMIN_TABLE_ROW_CLASS}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id} className={ADMIN_TABLE_CELL_CLASS}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
