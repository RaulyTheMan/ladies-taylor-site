import Link from "next/link";
import { Pencil, Trash2, LayoutGrid } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import type { WindowKind } from "@/components/desktop/types";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { deleteDockApp } from "./actions";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<WindowKind, string> = {
  video: "Video",
  article: "Article",
  photo: "Photo",
  email: "Email",
  document: "Document",
  newsfeed: "News Feed",
  chat: "Live Chat",
};

export default async function DockAppsPage() {
  const supabase = await createSessionClient();
  const { data: apps, error } = await supabase
    .from("desktop_dock_apps")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[admin/desktop/dock] query failed:", error);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Dock apps"
        description="Icons in the dock at the bottom of the homepage desktop scene. The set is fixed — edit an icon to change what it opens; new icons aren't added here."
      />

      {error && (
        <div className="mt-4 rounded-admin-md border border-admin-danger/30 bg-admin-danger-surface px-3 py-2 text-[13px] text-admin-danger">
          Couldn&apos;t load dock apps — the database query failed. Check the
          server logs.
        </div>
      )}

      <div className="mt-5">
        {(apps ?? []).length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No dock apps"
            description="The dock is empty, which usually means the seed data hasn't run."
          />
        ) : (
          <div className="overflow-x-auto rounded-admin-lg border border-admin-border">
            <table className="w-full border-collapse text-left text-[13px]">
              <caption className="sr-only">
                Icons in the homepage dock
              </caption>
              <thead>
                <tr className="bg-admin-surface">
                  {["Label", "Opens", "Status"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="whitespace-nowrap border-b border-admin-border px-3 py-2 text-xs font-semibold text-admin-fg"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="border-b border-admin-border px-3 py-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(apps ?? []).map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-admin-border last:border-0 hover:bg-admin-surface"
                  >
                    <td className="px-3 py-2 font-medium text-admin-fg">
                      {app.label}
                    </td>
                    <td className="px-3 py-2 text-admin-muted">
                      {app.kind
                        ? `${KIND_LABELS[app.kind]} window`
                        : app.href
                          ? app.href
                          : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={app.is_live ? "neutral" : "outline"}>
                        {app.is_live ? "Live" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/desktop/dock/${app.id}/edit`}
                          aria-label={`Edit "${app.label}"`}
                          className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteDockApp(app.id, app.label);
                          }}
                        >
                          <ConfirmButton
                            confirmTitle="Delete this dock app?"
                            confirmMessage={`"${app.label}" will be permanently removed from the homepage dock. This can't be undone.`}
                            ariaLabel={`Delete "${app.label}"`}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
