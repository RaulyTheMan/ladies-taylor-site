import type { Tables } from "@/lib/supabase/database.types";

export const DESKTOP_WINDOW_TABS = [
  { value: "all", label: "All" },
  { value: "articles", label: "Articles" },
  { value: "video", label: "Video" },
  { value: "live", label: "Live" },
  { value: "chat", label: "Chat" },
  { value: "images", label: "Images" },
  { value: "other", label: "Other" },
];

// Shared between the admin listing page (what's visible per tab) and
// reorderWindow (which neighbor to swap with) so a tab's up/down arrows only
// ever reorder against windows actually shown on that tab, instead of
// silently swapping order against a hidden window from a different kind.
export function matchesDesktopTab(win: Tables<"desktop_windows">, tab: string) {
  switch (tab) {
    case "articles":
      return win.kind === "article";
    case "video":
      return win.kind === "video" && !win.is_stream_master;
    case "live":
      return win.kind === "video" && win.is_stream_master;
    case "chat":
      return win.kind === "chat";
    case "images":
      return win.kind === "photo";
    case "other":
      return win.kind === "email" || win.kind === "document" || win.kind === "newsfeed";
    default:
      return true;
  }
}
