import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  MessageSquare,
  AppWindow,
} from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Card, { EmptyState } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { FOCUS_RING } from "@/components/ui/focus";
import StudioTabs from "@/components/studio/StudioTabs";
import { formatDateTime } from "@/lib/ui/formatDate";
import { cn } from "@/lib/ui/cn";
import { DESKTOP_WINDOW_TABS, matchesDesktopTab } from "@/lib/admin/desktopTabs";
import {
  deleteStreamComment,
  deleteWindow,
  reorderWindow,
  toggleWindowLive,
} from "./actions";

export const dynamic = "force-dynamic";

// "New window" pre-selects the kind matching the active tab. Tabs spanning
// several kinds (All, Other) leave it unset — pick in the form.
const NEW_WINDOW_KIND: Record<string, string | undefined> = {
  articles: "article",
  video: "video",
  live: "video",
  chat: "chat",
  images: "photo",
};

export default async function DesktopWindowsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam ?? "all";

  const supabase = await createSessionClient();
  const { data: allWindows, error } = await supabase
    .from("desktop_windows")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[admin/desktop] query failed:", error);
  }

  const windows = (allWindows ?? []).filter((win) => matchesDesktopTab(win, tab));
  const newWindowKind = NEW_WINDOW_KIND[tab];
  const newWindowHref = newWindowKind
    ? `/admin/desktop/new?kind=${newWindowKind}`
    : "/admin/desktop/new";

  // The Chat tab moderates actual live-stream messages, not the "chat" kind
  // window's own config — that's still reachable by editing its card.
  const { data: comments } =
    tab === "chat"
      ? await supabase
          .from("stream_comments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200)
      : { data: null };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Desktop windows"
        description="The draggable windows on the homepage's desktop scene."
        actions={
          tab !== "chat" && (
            <Link href={newWindowHref} className={buttonClasses()}>
              New window
            </Link>
          )
        }
      />

      {error && (
        <div className="mt-4 rounded-admin-md border border-admin-danger/30 bg-admin-danger-surface px-3 py-2 text-[13px] text-admin-danger">
          Couldn&apos;t load windows — the database query failed. Check the
          server logs.
        </div>
      )}

      <div className="mt-4">
        <StudioTabs
          tabs={DESKTOP_WINDOW_TABS}
          current={tab}
          basePath="/admin/desktop"
        />
      </div>

      {tab === "chat" ? (
        <div className="mt-4">
          {(comments ?? []).length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No chat messages yet"
              description="Messages posted in the homepage live chat appear here for moderation."
            />
          ) : (
            <div className="overflow-x-auto rounded-admin-lg border border-admin-border">
              <table className="w-full border-collapse text-left text-[13px]">
                <caption className="sr-only">
                  Live-stream chat messages, newest first
                </caption>
                <thead>
                  <tr className="bg-admin-surface">
                    {["Name", "Message", "Sent"].map((h) => (
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
                  {(comments ?? []).map((comment) => (
                    <tr
                      key={comment.id}
                      className="border-b border-admin-border last:border-0 hover:bg-admin-surface"
                    >
                      <td className="px-3 py-2 font-medium text-admin-fg">
                        {comment.name}
                      </td>
                      <td className="px-3 py-2 text-admin-muted">
                        {comment.message}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-admin-muted">
                        {formatDateTime(comment.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        <form
                          action={async () => {
                            "use server";
                            await deleteStreamComment(comment.id);
                          }}
                          className="flex justify-end"
                        >
                          <ConfirmButton
                            confirmTitle="Delete this message?"
                            confirmMessage={`This will remove ${comment.name}'s message from the live chat. This can't be undone.`}
                            ariaLabel={`Delete message from ${comment.name}`}
                            className={buttonClasses(
                              "ghost",
                              "sm",
                              "w-[26px] px-0 text-admin-muted hover:bg-admin-danger-surface hover:text-admin-danger"
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : windows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={AppWindow}
            title="No windows on this tab"
            description="Windows you add here become draggable panels on the homepage."
            action={
              <Link href={newWindowHref} className={buttonClasses()}>
                New window
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {windows.map((win, i) => (
            <Card key={win.id} className="flex flex-col p-4">
              <p className="font-medium text-admin-fg">{win.title}</p>

              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline">{win.kind}</Badge>
                <Badge variant={win.is_live ? "neutral" : "outline"}>
                  {win.is_live ? "Live" : "Hidden"}
                </Badge>
                {win.default_open && <Badge variant="accent">Opens by default</Badge>}
                {win.is_stream_master && <Badge variant="accent">Stream master</Badge>}
                {win.is_ambient_muted && <Badge variant="outline">Ambient muted</Badge>}
              </div>

              <div className="mt-auto flex items-center gap-1 border-t border-admin-border pt-3">
                <form
                  action={reorderWindow.bind(null, win.id, win.order_index, "up", tab)}
                >
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label={`Move "${win.title}" up`}
                    className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
                <form
                  action={reorderWindow.bind(null, win.id, win.order_index, "down", tab)}
                >
                  <button
                    type="submit"
                    disabled={i === windows.length - 1}
                    aria-label={`Move "${win.title}" down`}
                    className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await toggleWindowLive(win.id, !win.is_live);
                  }}
                >
                  <button
                    type="submit"
                    aria-label={
                      win.is_live
                        ? `Hide "${win.title}" from the homepage`
                        : `Show "${win.title}" on the homepage`
                    }
                    className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
                  >
                    {win.is_live ? (
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </form>
                <Link
                  href={`/admin/desktop/${win.id}/edit`}
                  aria-label={`Edit "${win.title}"`}
                  className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteWindow(win.id, win.title);
                  }}
                  className="ml-auto"
                >
                  <ConfirmButton
                    confirmTitle="Delete this window?"
                    confirmMessage={`"${win.title}" will be permanently removed from the homepage desktop scene. This can't be undone.`}
                    ariaLabel={`Delete "${win.title}"`}
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
            </Card>
          ))}

          <Link
            href={newWindowHref}
            className={cn(
              "flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-admin-lg border border-dashed border-admin-border text-admin-muted transition-colors hover:border-admin-border-strong hover:text-admin-fg",
              FOCUS_RING
            )}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            <span className="text-[13px]">New window</span>
          </Link>
        </div>
      )}
    </div>
  );
}
