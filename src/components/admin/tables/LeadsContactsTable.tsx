"use client";

import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import AdminSortableTable from "@/components/admin/AdminSortableTable";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { ADMIN_INPUT_CLASS } from "@/lib/admin/ui";
import type { Tables } from "@/lib/supabase/database.types";
import { updateContactStatus } from "@/app/admin/(dashboard)/leads/actions";

type ContactRow = Tables<"contact_submissions">;

const helper = createColumnHelper<typeof adminTableFeatures, ContactRow>();

export default function LeadsContactsTable({
  contacts,
  emptyMessage,
}: {
  contacts: ContactRow[];
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
          const contact = row.original;
          const formId = `contact-form-${contact.id}`;
          return (
            <>
              <label htmlFor={`notes-${contact.id}`} className="sr-only">
                Notes for {contact.name}
              </label>
              <input
                id={`notes-${contact.id}`}
                name="notes"
                form={formId}
                defaultValue={contact.notes ?? ""}
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
          const contact = row.original;
          const formId = `contact-form-${contact.id}`;
          return (
            <>
              <label htmlFor={`status-${contact.id}`} className="sr-only">
                Status for {contact.name}
              </label>
              <select
                id={`status-${contact.id}`}
                name="status"
                form={formId}
                defaultValue={contact.status}
                className={`${ADMIN_INPUT_CLASS} mt-0 w-32`}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
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
          const contact = row.original;
          const formId = `contact-form-${contact.id}`;
          return (
            // The interactive notes/status fields for this row live in
            // other cells (other <td>s in the same <tr>) and reference this
            // form purely by id via their own `form` attribute — that
            // association works regardless of DOM distance, so this <form>
            // only needs to wrap the submit button itself.
            <form
              id={formId}
              action={updateContactStatus.bind(null, contact.id)}
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
      data={contacts}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage={emptyMessage}
    />
  );
}
