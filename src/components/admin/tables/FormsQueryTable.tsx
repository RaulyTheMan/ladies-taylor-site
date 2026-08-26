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
      helper.accessor("brand_name", {
        header: "Company",
        cell: ({ row }) => (
          <span className="text-black/70">
            {row.original.brand_name}
            {row.original.website_url && (
              <>
                <br />
                <a
                  href={row.original.website_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  {row.original.website_url}
                </a>
              </>
            )}
            {row.original.brand_category && (
              <>
                <br />
                <span className={ADMIN_BADGE_CLASS}>{row.original.brand_category}</span>
              </>
            )}
          </span>
        ),
      }),
      helper.display({
        id: "needs",
        header: "Needs",
        enableSorting: false,
        cell: ({ row }) => {
          const services = row.original.services;
          return (
            <span className="block max-w-[240px] text-black/70">
              {services && services.length > 0 ? services.join(", ") : "\u2014"}
              {row.original.timeline && (
                <>
                  <br />
                  <span className={ADMIN_BADGE_CLASS}>{row.original.timeline}</span>
                </>
              )}
            </span>
          );
        },
      }),
      helper.display({
        id: "profile",
        header: "Profile",
        enableSorting: false,
        cell: ({ row }) => {
          const submission = row.original;
          // Pre-Aug-25 rows have city/about_brand instead of the qualifying
          // answers, so show whichever set the row actually has.
          const lines = [
            submission.business_stage,
            submission.role,
            submission.has_branding ? `Branding: ${submission.has_branding}` : null,
            submission.city,
          ].filter(Boolean);
          return (
            <span className="block max-w-[220px] text-black/70">
              {lines.length > 0 ? lines.join(" \u00b7 ") : "\u2014"}
              {submission.about_brand && (
                <>
                  <br />
                  <span
                    className="block max-w-[220px] truncate text-black/50"
                    title={submission.about_brand}
                  >
                    {submission.about_brand}
                  </span>
                </>
              )}
            </span>
          );
        },
      }),
      helper.accessor("budget", {
        header: "Budget",
        cell: ({ row }) => (
          <span className="text-black/70">{row.original.budget}</span>
        ),
      }),
      helper.accessor("fb_reported_status", {
        header: "Meta",
        cell: ({ row }) => {
          const submission = row.original;
          if (!submission.fb_lead_sent_at) {
            // Not an error: nothing is reported until a lead reaches "contact".
            return <span className="text-black/30">\u2014</span>;
          }
          const sent = submission.fb_reported_status === "sent";
          return (
            <span
              className={sent ? "text-black/70" : "font-semibold text-lt-red"}
              title={`QualifiedLead ${sent ? "accepted by Meta" : "rejected by Meta"} on ${new Date(
                submission.fb_lead_sent_at
              ).toLocaleString()}`}
            >
              {sent ? "Sent" : "Failed"}
            </span>
          );
        },
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
