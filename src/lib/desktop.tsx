import Image from "next/image";
import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import type { Tables } from "@/lib/supabase/database.types";
import type { NewsfeedItem } from "@/components/desktop/window-content/NewsfeedContent";
import type { StreamComment } from "@/components/desktop/window-content/types";
import type {
  DockApp,
  WindowContentData,
  WindowDef,
  WindowKind,
} from "@/components/desktop/types";
import type { TiptapDoc } from "@/lib/richtext/types";

const KIND_DEFAULTS: Record<
  WindowKind,
  { width: number; height: number; minWidth: number; minHeight: number }
> = {
  video: { width: 260, height: 300, minWidth: 220, minHeight: 240 },
  article: { width: 380, height: 380, minWidth: 300, minHeight: 280 },
  email: { width: 340, height: 400, minWidth: 280, minHeight: 340 },
  document: { width: 320, height: 300, minWidth: 280, minHeight: 220 },
  newsfeed: { width: 300, height: 380, minWidth: 260, minHeight: 260 },
  photo: { width: 300, height: 320, minWidth: 240, minHeight: 240 },
  chat: { width: 300, height: 380, minWidth: 260, minHeight: 280 },
};

function cascadePosition(index: number) {
  const cols = 5;
  const step = 32;
  return {
    x: 24 + (index % cols) * step * 2,
    y: 32 + (index % cols) * step,
  };
}

// The homepage stream video + live chat are meant to open large and
// side-by-side by default (not the small cascaded squares other kinds use).
const STREAM_ROW_Y = 24;
const STREAM_VIDEO_X = 24;
const STREAM_VIDEO_WIDTH = 920;
const STREAM_ROW_HEIGHT = 560;
const STREAM_GAP = 16;
const STREAM_CHAT_X = STREAM_VIDEO_X + STREAM_VIDEO_WIDTH + STREAM_GAP;
const STREAM_CHAT_WIDTH = 460;

const STREAM_VIDEO_LAYOUT = {
  x: STREAM_VIDEO_X,
  y: STREAM_ROW_Y,
  width: STREAM_VIDEO_WIDTH,
  height: STREAM_ROW_HEIGHT,
  minWidth: 360,
  minHeight: 240,
};
const STREAM_CHAT_LAYOUT = {
  x: STREAM_CHAT_X,
  y: STREAM_ROW_Y,
  width: STREAM_CHAT_WIDTH,
  height: STREAM_ROW_HEIGHT,
  minWidth: 320,
  minHeight: 360,
};

// The stream-master video (desktop_windows.is_stream_master) broadcasts its
// playback time so DesktopHero can auto-open other windows at scripted cue
// points, and gets the big side-by-side stream+chat row layout below.
// Ambient-muted videos (is_ambient_muted) play silently in the background
// with no way to unmute — they're atmosphere, not something visitors are
// meant to listen to. Any other video window sizes itself off its real
// uploaded aspect ratio instead of the fixed kind default, so a portrait
// clip opens as a small portrait popup rather than a landscape square.
const POPUP_VIDEO_MAX_WIDTH = 260;

function computePopupVideoSize(
  videoWidth: number,
  videoHeight: number,
  fallback: { width: number; height: number; minWidth: number; minHeight: number }
) {
  const aspect = videoWidth / videoHeight;
  const width = Math.max(
    fallback.minWidth,
    Math.round(Math.min(videoWidth, POPUP_VIDEO_MAX_WIDTH))
  );
  const height = Math.max(fallback.minHeight, Math.round(width / aspect));
  return { width, height };
}

function buildContent(
  row: Tables<"desktop_windows">,
  initialComments: StreamComment[]
): WindowContentData {
  const content = (row.content ?? {}) as Record<string, unknown>;

  switch (row.kind) {
    case "video":
      return {
        kind: "video",
        timestamp: content.timestamp as string | undefined,
        caption: content.caption as string | undefined,
        posterUrl: row.media_url ?? undefined,
        videoUrl: row.video_url ?? undefined,
        allowUnmute: !row.is_ambient_muted,
        broadcastTimeUpdates: row.is_stream_master,
        loop: !row.is_stream_master,
      };
    case "article":
      return {
        kind: "article",
        headline: (content.headline as string) ?? row.title,
        body: content.body as TiptapDoc | undefined,
        paragraphs: content.paragraphs as string[] | undefined,
        withVideo: content.withVideo as boolean | undefined,
        imageUrl: row.media_url ?? undefined,
      };
    case "photo":
      return {
        kind: "photo",
        caption: content.caption as string | undefined,
        imageUrl: row.media_url ?? undefined,
      };
    case "email":
      return {
        kind: "email",
        from: content.from as string | undefined,
        subject: content.subject as string | undefined,
        dateLabel: content.dateLabel as string | undefined,
        introBody: content.body as string | undefined,
        ctaLabel: content.ctaLabel as string | undefined,
      };
    case "document":
      return {
        kind: "document",
        headline: (content.headline as string) ?? row.title,
        body: content.body as TiptapDoc | undefined,
        paragraphs: content.paragraphs as string[] | undefined,
      };
    case "newsfeed":
      return {
        kind: "newsfeed",
        items: (content.items as NewsfeedItem[]) ?? [],
      };
    case "chat":
      return { kind: "chat", initialComments };
  }
}

const INITIAL_COMMENT_LIMIT = 50;

async function getInitialStreamComments(
  supabase: ReturnType<typeof createPublicClient>
): Promise<StreamComment[]> {
  const { data } = await supabase
    .from("stream_comments")
    .select("id, name, message, created_at")
    .order("created_at", { ascending: false })
    .limit(INITIAL_COMMENT_LIMIT);
  return (data ?? []).reverse();
}

export async function getDesktopWindows(): Promise<WindowDef[]> {
  const supabase = createPublicClient();
  const [{ data, error }, initialComments] = await Promise.all([
    supabase
      .from("desktop_windows")
      .select("*")
      .eq("is_live", true)
      .order("order_index", { ascending: true }),
    getInitialStreamComments(supabase),
  ]);

  if (error) logQueryError("getDesktopWindows", error);
  if (error || !data) return [];

  return data.map((row, i) => {
    const streamLayout =
      row.kind === "video" && row.is_stream_master
        ? STREAM_VIDEO_LAYOUT
        : row.kind === "chat"
          ? STREAM_CHAT_LAYOUT
          : undefined;

    if (streamLayout) {
      return {
        id: row.id,
        kind: row.kind,
        title: row.title,
        defaultX: streamLayout.x,
        defaultY: streamLayout.y,
        defaultWidth: streamLayout.width,
        defaultHeight: streamLayout.height,
        minWidth: streamLayout.minWidth,
        minHeight: streamLayout.minHeight,
        defaultOpen: row.default_open,
        content: buildContent(row, initialComments),
      };
    }

    const size = KIND_DEFAULTS[row.kind];
    const pos = cascadePosition(i);
    const { width, height } =
      row.kind === "video" && row.video_width && row.video_height
        ? computePopupVideoSize(row.video_width, row.video_height, size)
        : size;
    return {
      id: row.id,
      kind: row.kind,
      title: row.title,
      defaultX: pos.x,
      defaultY: pos.y,
      defaultWidth: width,
      defaultHeight: height,
      minWidth: size.minWidth,
      minHeight: size.minHeight,
      defaultOpen: row.default_open,
      content: buildContent(row, initialComments),
    };
  });
}

function DockIcon({ src, label }: { src: string; label: string }) {
  return (
    <Image src={src} alt={label} width={200} height={200} className="h-full w-full" />
  );
}

export async function getDesktopDockApps(): Promise<DockApp[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("desktop_dock_apps")
    .select("*")
    .eq("is_live", true)
    .order("order_index", { ascending: true });

  if (error) logQueryError("getDesktopDockApps", error);
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    label: row.label,
    icon: <DockIcon src={row.icon_url} label={row.label} />,
    kind: row.kind ?? undefined,
    // notification_count is only meaningful for plain-link apps (no kind) —
    // kind-grouped apps compute their badge from unopened windows instead.
    notificationCount: row.kind ? undefined : row.notification_count ?? undefined,
    href: row.kind ? undefined : row.href ?? undefined,
  }));
}
