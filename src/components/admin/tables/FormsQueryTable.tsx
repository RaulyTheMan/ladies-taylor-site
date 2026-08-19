"use client";

import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import AdminSortableTable from "@/components/admin/AdminSortableTable";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { ADMIN_INPUT_CLASS, ADMIN_BADGE_CLASS } from "@/lib/admin/ui";
import { LEAD_STATUS_OPTIONS } from "@/lib/admin/leadStatus";
import type { Tables } from "@/lib/supabase/database.types";
import { updateFormQueryStatus } from "@/app/admin/(dashboard)/forms/actions";

type QueryRow = Tables<"august_query_submissions">;

const helper = createColumnHelper<typeof adminTableFeatures, QueryRow>();

export default function FormsQueryTable({
  submissions,
  emptyMessage,
}: {
  submissions: QueryRow[];
  emptyMessage: string;
}) {
  const columns = useMemo(
    () => [
      helper.accessor("name", {
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-black">{row.original.name}</span>
        ),
      }),
      helper.accessor("email", {
        header: "Contact",
        cell: ({ row }) => (
          <span className="text-black/70">
            {row.original.phone}
            <br />
            {row.original.email}
          </span>
        ),
      }),
      helper.accessor("city", {
        header: "City",
        cell: ({ row }) => (
          <span className="text-black/70">{row.original.city}</span>
        ),
      }),
      helper.accessor("brand_name", {
        header: "Brand",
        cell: ({ row }) => (
          <span className="text-black/70">
            {row.original.brand_name}
            <br />
            <span className={ADMIN_BADGE_CLASS}>
              {row.original.brand_category}
            </span>
          </span>
        ),
      }),
      helper.accessor("services", {
        header: "Services",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-black/70">
            {row.original.services.join(", ")}
          </span>
        ),
      }),
      helper.accessor("budget", {
        header: "Budget",
        cell: ({ row }) => (
          <span className="text-black/70">{row.original.budget}</span>
        ),
      }),
      helper.accessor("created_at", {
        header: "Received",
        cell: ({ row }) => (
          <span className="text-black/60">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      }),
      helper.display({
        id: "notes",
        header: "Notes",
        enableSorting: false,
        cell: ({ row }) => {
          const submission = row.original;
          const formId = `form-query-${submission.id}`;
          return (
            <>
              <label htmlFor={`notes-${submission.id}`} className="sr-only">
                Notes for {submission.name}
              </label>
              <input
                id={`notes-${submission.id}`}
                name="notes"
                form={formId}
                defaultValue={submission.notes ?? ""}
                placeholder="Notes"
                className={`${ADMIN_INPUT_CLASS} mt-0 w-40`}
              />
            </>
          );
        },
      }),
      helper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
          const submission = row.original;
          const formId = `form-query-${submission.id}`;
          return (
            <>
              <label htmlFor={`status-${submission.id}`} className="sr-only">
                Status for {submission.name}
              </label>
              <select
                id={`status-${submission.id}`}
                name="status"
                form={formId}
                defaultValue={submission.status}
                className={`${ADMIN_INPUT_CLASS} mt-0 w-44`}
              >
                {LEAD_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          );
        },
      }),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const submission = row.original;
          const formId = `form-query-${submission.id}`;
          return (
            // Same pattern as LeadsContactsTable: the notes/status cells
            // reference this form by id via their own `form` attribute, so
            // this <form> only needs to wrap the submit button.
            <form
              id={formId}
              action={updateFormQueryStatus.bind(null, submission.id)}
              className="contents"
            >
              <button
                type="submit"
                className="rounded px-2 py-2 text-xs font-semibold text-black/70 underline hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Save
              </button>
            </form>
          );
        },
      }),
    ],
    []
  );

  return (
    <AdminSortableTable
      data={submissions}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage={emptyMessage}
    />
  );
}
