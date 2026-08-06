import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import type { WindowKind } from "@/components/desktop/types";
import {
  ADMIN_H1_CLASS,
  ADMIN_ICON_BUTTON_CLASS,
  ADMIN_ICON_BUTTON_DANGER_CLASS,
  ADMIN_TABLE_CELL_CLASS,
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_ROW_CLASS,
  ADMIN_TABLE_ROW_CLASS,
  ADMIN_TABLE_WRAPPER_CLASS,
  ADMIN_BADGE_CLASS,
} from "@/lib/admin/ui";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { deleteDockApp } from "./actions";

const KIND_LABELS: Record<WindowKind, string> = {
  video: "Video",
  article: "Article",
  photo: "Photo",
  email: "Email",
  document: "Document",
  newsfeed: "News Feed",
  chat: "Live Chat",
};

export default async function AdminDockAppsPage() {
  const supabase = await createSessionClient();
  const { data: apps } = await supabase
    .from("desktop_dock_apps")
    .select("*")
    .order("order_index", { ascending: true });

  return (
    <div>
      <h1 className={ADMIN_H1_CLASS}>Dock Apps</h1>
      <p className="mt-2 text-xs text-black/60">
        Icons in the dock at the bottom of the homepage desktop scene. This
        set is fixed — edit an icon to change what it opens, but new icons
        aren&apos;t added here.
      </p>

      <div className={`mt-6 ${ADMIN_TABLE_WRAPPER_CLASS}`}>
        <table className={ADMIN_TABLE_CLASS}>
          <thead>
            <tr className={ADMIN_TABLE_HEAD_ROW_CLASS}>
              <th className={ADMIN_TABLE_CELL_CLASS}>Label</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Destination</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Status</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(apps ?? []).map((app) => (
              <tr key={app.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className={`${ADMIN_TABLE_CELL_CLASS} font-medium text-black`}>
                  {app.label}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {app.kind
                    ? `Kind: ${KIND_LABELS[app.kind]}`
                    : app.href
                      ? `Link: ${app.href}`
                      : "—"}
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <span className={ADMIN_BADGE_CLASS}>
                    {app.is_live ? "Live" : "Hidden"}
                  </span>
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/desktop/dock/${app.id}/edit`}
                      aria-label={`Edit "${app.label}"`}
                      className={ADMIN_ICON_BUTTON_CLASS}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteDockApp(app.id, app.label);
                      }}
                    >
                      <ConfirmSubmitButton
                        confirmTitle="Delete this dock app?"
                        confirmMessage={`"${app.label}" will be permanently removed from the homepage dock. This can't be undone.`}
                        className={ADMIN_ICON_BUTTON_DANGER_CLASS}
                        ariaLabel={`Delete "${app.label}"`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(apps ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}
                >
                  No dock apps yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
