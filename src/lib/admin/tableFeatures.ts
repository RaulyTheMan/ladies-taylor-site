import {
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

// Shared across every admin table so they all use the same registered
// feature set (TanStack Table v9 requires features to be explicitly
// registered rather than bundling everything by default) — sorting is the
// only behavior any admin table needs right now.
export const adminTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});
