"use client";

import { useMemo, useState } from "react";
import { Trash2, Users, ArrowUp, Ban, Eye } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/DataTable";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/Card";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { adminTableFeatures } from "@/lib/admin/tableFeatures";
import { formatDate } from "@/lib/ui/formatDate";
import type { Tables } from "@/lib/supabase/database.types";
import {
  updateRegistrationStatus,
  deleteRegistration,
} from "@/app/admin/(studio)/events/[id]/participants/actions";

type RegistrationRow = Tables<"event_registrations">;

const STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  registered: { label: "Registered", variant: "neutral" },
  waiting: { label: "Waiting", variant: "accent" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

const helper = createColumnHelper<typeof adminTableFeatures, RegistrationRow>();

export default function ParticipantsTable({
  registrations,
  eventSlug,
}: {
  registrations: RegistrationRow[];
  eventSlug: string;
}) {
  // The full record for the row being inspected. "Why they signed up" is
  // free text that doesn't fit a cell, and truncating it to three lines with
  // only a title attribute made it unreadable on touch devices.
  const [inspecting, setInspecting] = useState<RegistrationRow | null>(null);

  const columns = useMemo(
    () => [
      helper.accessor("name", {
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-admin-fg">{row.original.name}</span>
        ),
      }),
      helper.accessor("email", {
        header: "Contact",
        cell: ({ row }) => (
          <div className="text-admin-muted">
            <div>{row.original.phone}</div>
            <div>{row.original.email}</div>
          </div>
        ),
      }),
      helper.accessor((row) => row.brand_name ?? "", {
        id: "brand",
        header: "Brand / role",
        cell: ({ row }) => {
          const { brand_name, designation } = row.original;
          if (!brand_name && !designation) {
            return <span className="text-admin-muted">—</span>;
          }
          return (
            <div className="text-admin-muted">
              {brand_name && <div>{brand_name}</div>}
              {designation && <div>{designation}</div>}
            </div>
          );
        },
      }),
      helper.accessor("created_at", {
        header: "Signed up",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-admin-muted">
            {formatDate(row.original.created_at)}
          </span>
        ),
      }),
      helper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
          const s = STATUS[row.original.status] ?? {
            label: row.original.status,
            variant: "neutral" as BadgeVariant,
          };
          return <Badge variant={s.variant}>{s.label}</Badge>;
        },
      }),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const reg = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspecting(reg)}
                aria-label={`View ${reg.name}'s sign-up`}
                className="w-[26px] px-0"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>

              {reg.status === "waiting" && (
                <form
                  action={updateRegistrationStatus.bind(
                    null,
                    reg.id,
                    eventSlug,
                    "registered"
                  )}
                >
                  <button
                    type="submit"
                    aria-label={`Promote ${reg.name} to registered`}
                    className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
              )}

              {reg.status !== "cancelled" && (
                <form
                  action={updateRegistrationStatus.bind(
                    null,
                    reg.id,
                    eventSlug,
                    "cancelled"
                  )}
                >
                  <button
                    type="submit"
                    aria-label={`Cancel ${reg.name}'s sign-up`}
                    className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
                  >
                    <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
              )}

              <form action={deleteRegistration.bind(null, reg.id, eventSlug)}>
                <ConfirmButton
                  confirmTitle="Remove this sign-up?"
                  confirmMessage={`${reg.name}'s registration will be permanently removed. This can't be undone.`}
                  ariaLabel={`Delete ${reg.name}'s sign-up`}
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
    [eventSlug]
  );

  return (
    <>
      <DataTable
        data={registrations}
        columns={columns}
        getRowId={(row) => row.id}
        caption="People who signed up for this event"
        empty={
          <EmptyState
            icon={Users}
            title="No sign-ups yet"
            description="Registrations from the public event page appear here."
          />
        }
      />

      <Dialog
        open={inspecting !== null}
        onOpenChange={(open) => !open && setInspecting(null)}
      >
        {inspecting && (
          <DialogContent
            title={inspecting.name}
            description={`Signed up ${formatDate(inspecting.created_at)}`}
          >
            <dl className="flex flex-col gap-3 text-[13px]">
              <Detail label="Email" value={inspecting.email} />
              <Detail label="Phone" value={inspecting.phone} />
              <Detail label="Brand" value={inspecting.brand_name} />
              <Detail label="Role" value={inspecting.designation} />
              <Detail label="Why they signed up" value={inspecting.reason} />
              <Detail
                label="Status"
                value={STATUS[inspecting.status]?.label ?? inspecting.status}
              />
            </dl>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-admin-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-admin-fg">
        {value || "—"}
      </dd>
    </div>
  );
}
