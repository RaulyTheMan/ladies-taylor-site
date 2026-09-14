"use client";

import { useMemo, useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/Card";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { formatDate, formatDateTime } from "@/lib/ui/formatDate";
import type { Tables } from "@/lib/supabase/database.types";

type SubmissionRow = Tables<"mera_brand_maro_submissions">;

const helper = createColumnHelper<typeof adminTableFeatures, SubmissionRow>();

const linkClass =
  "text-admin-fg underline decoration-admin-border-strong underline-offset-2 hover:decoration-admin-fg";

/** Visitors type "brand.com" as often as a full URL; only the href needs a scheme. */
function websiteHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** Same RFC 4180 quoting as the subscribers export. */
function csvCell(value: string | null): string {
  return `"${(value ?? "").replace(/"/g, '""')}"`;
}

function toCsv(rows: SubmissionRow[]): string {
  return [
    [
      "Submitted",
      "Name",
      "Number",
      "Email",
      "Website",
      "Brand",
      "About the brand",
      "Why no branding budget",
      "Terms version",
    ],
    ...rows.map((r) => [
      new Date(r.created_at).toISOString(),
      r.name,
      r.phone,
      r.email,
      r.website_url,
      r.brand_name,
      r.about_brand,
      r.why_no_budget,
      r.terms_version,
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}

export function MeraBrandMaroExportButton({ submissions }: { submissions: SubmissionRow[] }) {
  const download = () => {
    const blob = new Blob([toCsv(submissions)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mera-brand-maro-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="secondary" onClick={download} disabled={submissions.length === 0}>
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      Export CSV
      {submissions.length > 0 && ` (${submissions.length})`}
    </Button>
  );
}

function Answer({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-admin-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap break-words text-[13px] text-admin-fg">
        {children}
      </dd>
    </div>
  );
}

export default function MeraBrandMaroTable({
  submissions,
  filtered,
}: {
  submissions: SubmissionRow[];
  filtered: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = submissions.find((s) => s.id === openId) ?? null;

  const columns = useMemo(
    () => [
      helper.accessor("brand_name", {
        header: "Brand",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setOpenId(row.original.id)}
            className={`text-left font-medium ${linkClass}`}
          >
            {row.original.brand_name}
          </button>
        ),
      }),
      helper.accessor("name", { header: "Name" }),
      helper.accessor("phone", {
        header: "Number",
        cell: ({ row }) => (
          <a href={`tel:${row.original.phone}`} className={`whitespace-nowrap ${linkClass}`}>
            {row.original.phone}
          </a>
        ),
      }),
      helper.accessor("email", {
        header: "Email",
        cell: ({ row }) => (
          <a href={`mailto:${row.original.email}`} className={linkClass}>
            {row.original.email}
          </a>
        ),
      }),
      helper.accessor("created_at", {
        header: "Submitted",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-admin-muted">
            {formatDate(row.original.created_at)}
          </span>
        ),
      }),
      helper.display({
        id: "view",
        header: () => <span className="sr-only">View</span>,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" onClick={() => setOpenId(row.original.id)}>
            View
          </Button>
        ),
      }),
    ],
    []
  );

  return (
    <>
      <DataTable
        data={submissions}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Applications submitted through the Mera Brand Maro form"
        empty={
          filtered ? (
            <EmptyState
              icon={Sparkles}
              title="No submissions match your search"
              description="Try a different name, brand, email or number."
            />
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No submissions yet"
              description="Applications from /forms-mera-brand-maro appear here."
            />
          )
        }
      />

      <Dialog open={open !== null} onOpenChange={(next) => !next && setOpenId(null)}>
        {open && (
          <DialogContent
            title={open.brand_name}
            description={`Submitted ${formatDateTime(open.created_at)}`}
          >
            <dl className="flex flex-col gap-3">
              <Answer label="Name">{open.name}</Answer>
              <Answer label="Number">
                <a href={`tel:${open.phone}`} className={linkClass}>
                  {open.phone}
                </a>
              </Answer>
              <Answer label="Email">
                <a href={`mailto:${open.email}`} className={linkClass}>
                  {open.email}
                </a>
              </Answer>
              <Answer label="Website">
                {open.website_url ? (
                  <a
                    href={websiteHref(open.website_url)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={linkClass}
                  >
                    {open.website_url}
                  </a>
                ) : (
                  <span className="text-admin-muted">Not given</span>
                )}
              </Answer>
              <Answer label="About the brand">{open.about_brand}</Answer>
              <Answer label="Why they can't spend on branding">{open.why_no_budget}</Answer>
              <Answer label="Terms">
                All four accepted {formatDateTime(open.terms_accepted_at)} (version{" "}
                {open.terms_version})
              </Answer>
            </dl>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
