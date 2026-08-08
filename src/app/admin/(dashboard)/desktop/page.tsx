import Link from "next/link";
import { ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import {
  ADMIN_H1_CLASS,
  ADMIN_BADGE_CLASS,
  ADMIN_CARD_CLASS,
  ADMIN_ICON_BUTTON_CLASS,
  ADMIN_ICON_BUTTON_DANGER_CLASS,
  ADMIN_TABLE_CELL_CLASS,
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_ROW_CLASS,
  ADMIN_TABLE_ROW_CLASS,
} from "@/lib/admin/ui";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import AdminTabs from "@/components/admin/AdminTabs";
import { DESKTOP_WINDOW_TABS, matchesDesktopTab } from "@/lib/admin/desktopTabs";
import {
  deleteStreamComment,
  deleteWindow,
  reorderWindow,
  toggleWindowLive,
} from "./actions";

export const dynamic = "force-dynamic";

const TABS = DESKTOP_WINDOW_TABS;

// "+ New Window" pre-selects the kind matching the active tab. Tabs that
// span multiple kinds (All, Other) leave it unset — pick in the form.
const NEW_WINDOW_KIND: Record<string, string | undefined> = {
  articles: "article",
  video: "video",
  live: "video",
  chat: "chat",
  images: "photo",
};

export default async function AdminDesktopPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam ?? "all";

  const supabase = await createSessionClient();
  const { data: allWindows } = await supabase
    .from("desktop_windows")
    .select("*")
    .order("order_index", { ascending: true });

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
    <div>
      <h1 className={ADMIN_H1_CLASS}>Windows</h1>
      <p className="mt-2 text-xs text-black/60">
        These are the draggable windows on the homepage&apos;s desktop scene.
      </p>

      <div className="mt-6">
        <AdminTabs tabs={TABS} current={tab} />
      </div>

      {tab === "chat" ? (
        <table className={`mt-6 ${ADMIN_TABLE_CLASS}`}>
          <thead>
            <tr className={ADMIN_TABLE_HEAD_ROW_CLASS}>
              <th className={`${ADMIN_TABLE_CELL_CLASS} font-normal lowercase`}>name</th>
              <th className={`${ADMIN_TABLE_CELL_CLASS} font-normal lowercase`}>comment</th>
              <th className={`${ADMIN_TABLE_CELL_CLASS} font-normal lowercase`}>time</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(comments ?? []).map((comment) => (
              <tr key={comment.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className={`${ADMIN_TABLE_CELL_CLASS} font-medium text-black`}>
                  {comment.name}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {comment.message}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}>
                  {new Date(comment.created_at).toLocaleString()}
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <form
                    action={async () => {
                      "use server";
                      await deleteStreamComment(comment.id);
                    }}
                    className="flex justify-end"
                  >
                    <ConfirmSubmitButton
                      confirmTitle="Delete this message?"
                      confirmMessage={`This will remove ${comment.name}'s message from the live chat. This can't be undone.`}
                      className={ADMIN_ICON_BUTTON_DANGER_CLASS}
                      ariaLabel={`Delete message from ${comment.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {(comments ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}>
                  No chat messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {windows.map((win, i) => (
              <div key={win.id} className={`${ADMIN_CARD_CLASS} flex flex-col p-5`}>
                <p className="font-bold text-black underline decoration-black/20 underline-offset-4">
                  {win.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={ADMIN_BADGE_CLASS}>{win.kind}</span>
                  <span className={ADMIN_BADGE_CLASS}>
                    {win.is_live ? "Live" : "Hidden"}
                  </span>
                  {win.default_open && (
                    <span className={ADMIN_BADGE_CLASS}>Open by default</span>
                  )}
                  {win.is_stream_master && (
                    <span className={ADMIN_BADGE_CLASS}>Stream master</span>
                  )}
                  {win.is_ambient_muted && (
                    <span className={ADMIN_BADGE_CLASS}>Ambient muted</span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-1 border-t border-black/5 pt-3">
                  <form action={reorderWindow.bind(null, win.id, win.order_index, "up", tab)}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label={`Move "${win.title}" up`}
                      className={ADMIN_ICON_BUTTON_CLASS}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={reorderWindow.bind(null, win.id, win.order_index, "down", tab)}>
                    <button
                      type="submit"
                      disabled={i === windows.length - 1}
                      aria-label={`Move "${win.title}" down`}
                      className={ADMIN_ICON_BUTTON_CLASS}
                    >
                      <ArrowDown className="h-4 w-4" />
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
                      aria-label={win.is_live ? "Hide" : "Show"}
                      className={ADMIN_ICON_BUTTON_CLASS}
                    >
                      {win.is_live ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                  <Link
                    href={`/admin/desktop/${win.id}/edit`}
                    aria-label={`Edit "${win.title}"`}
                    className={ADMIN_ICON_BUTTON_CLASS}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteWindow(win.id, win.title);
                    }}
                    className="ml-auto"
                  >
                    <ConfirmSubmitButton
                      confirmTitle="Delete this window?"
                      confirmMessage={`"${win.title}" will be permanently removed from the homepage desktop scene. This can't be undone.`}
                      className={ADMIN_ICON_BUTTON_DANGER_CLASS}
                      ariaLabel={`Delete "${win.title}"`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            ))}

            <Link
              href={newWindowHref}
              aria-label="New window"
              className={`${ADMIN_CARD_CLASS} flex min-h-[140px] flex-col items-center justify-center gap-2 text-black/30 transition-colors hover:border-black/25 hover:text-black/50`}
            >
              <Plus className="h-8 w-8" strokeWidth={1.5} />
            </Link>
          </div>

          {windows.length === 0 && (
            <p className="mt-6 text-sm text-black/60">
              No windows here yet — click the{" "}
              <Plus className="inline h-3.5 w-3.5" /> tile to add one.
            </p>
          )}
        </>
      )}
    </div>
  );
}
