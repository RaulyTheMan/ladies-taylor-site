"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import {
  uploadMedia,
  extFromFile,
  VIDEO_MIME_TYPES,
  VIDEO_MAX_SIZE_BYTES,
} from "@/lib/admin/storage";
import type { Json } from "@/lib/supabase/database.types";
import type { WindowKind } from "@/components/desktop/types";
import { withFlash } from "@/lib/admin/flash";

const kindSchema = z.enum([
  "video",
  "article",
  "photo",
  "email",
  "document",
  "newsfeed",
  "chat",
]);

// Loose validation — the rich text editor is the only writer of this shape
// (Tiptap's own getJSON() output), so we just guard against malformed/missing
// JSON rather than fully re-validating every node type server-side.
const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.record(z.string(), z.unknown())).default([]),
});

function parseRichBody(formData: FormData): Json {
  return tiptapDocSchema.parse(
    JSON.parse(String(formData.get("body") ?? '{"type":"doc","content":[]}'))
  ) as Json;
}

function buildContent(kind: WindowKind, formData: FormData): Json {
  switch (kind) {
    case "video":
      return {
        timestamp: String(formData.get("timestamp") ?? "") || undefined,
        caption: String(formData.get("caption") ?? "") || undefined,
      } as Json;
    case "article":
      return {
        headline: String(formData.get("headline") ?? ""),
        body: parseRichBody(formData),
        withVideo: formData.get("withVideo") === "on",
      } as Json;
    case "photo":
      return {
        caption: String(formData.get("caption") ?? "") || undefined,
      } as Json;
    case "email":
      return {
        from: String(formData.get("from") ?? "") || undefined,
        subject: String(formData.get("subject") ?? "") || undefined,
        dateLabel: String(formData.get("dateLabel") ?? "") || undefined,
        body: String(formData.get("emailBody") ?? "") || undefined,
        ctaLabel: String(formData.get("ctaLabel") ?? "") || undefined,
        ctaHref: String(formData.get("ctaHref") ?? "") || undefined,
      } as Json;
    case "document":
      return {
        headline: String(formData.get("headline") ?? ""),
        body: parseRichBody(formData),
      } as Json;
    case "newsfeed":
      return {
        items: JSON.parse(String(formData.get("newsfeedItems") ?? "[]")),
      } as Json;
    default:
      return {} as Json;
  }
}

function revalidateDesktopPaths() {
  revalidatePath("/");
  revalidatePath("/admin/desktop");
}

async function extractVideoUpload(
  supabase: Awaited<ReturnType<typeof createSessionClient>>,
  formData: FormData
): Promise<{ videoUrl?: string; videoWidth?: number; videoHeight?: number }> {
  const file = formData.get("mediaVideo");
  if (!(file instanceof File) || file.size === 0) return {};

  const videoUrl = await uploadMedia(
    supabase,
    file,
    `desktop/video-${Date.now()}.${extFromFile(file)}`,
    { allowedMimeTypes: VIDEO_MIME_TYPES, maxSizeBytes: VIDEO_MAX_SIZE_BYTES }
  );
  const widthRaw = formData.get("videoWidth");
  const heightRaw = formData.get("videoHeight");
  return {
    videoUrl,
    videoWidth: widthRaw ? Number(widthRaw) : undefined,
    videoHeight: heightRaw ? Number(heightRaw) : undefined,
  };
}

export async function createWindow(formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();

  const kind = kindSchema.parse(formData.get("kind"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");

  let mediaUrl: string | undefined;
  const file = formData.get("mediaImage");
  if (file instanceof File && file.size > 0) {
    mediaUrl = await uploadMedia(
      supabase,
      file,
      `desktop/${kind}-${Date.now()}.${extFromFile(file)}`
    );
  }

  const video = kind === "video" ? await extractVideoUpload(supabase, formData) : {};

  const { data: maxRow } = await supabase
    .from("desktop_windows")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.order_index ?? -1) + 1;

  const { error } = await supabase.from("desktop_windows").insert({
    kind,
    title,
    content: buildContent(kind, formData),
    media_url: mediaUrl,
    video_url: video.videoUrl,
    video_width: video.videoWidth,
    video_height: video.videoHeight,
    order_index: nextOrder,
    is_live: formData.get("isLive") === "on",
    default_open: formData.get("defaultOpen") === "on",
    is_stream_master: formData.get("isStreamMaster") === "on",
    is_ambient_muted: formData.get("isAmbientMuted") === "on",
  });

  if (error) throw new Error(error.message);

  revalidateDesktopPaths();
  redirect(withFlash("/admin/desktop", `Window "${title}" created.`));
}

export async function updateWindow(id: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();

  const kind = kindSchema.parse(formData.get("kind"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");

  let mediaUrl: string | undefined;
  const file = formData.get("mediaImage");
  if (file instanceof File && file.size > 0) {
    mediaUrl = await uploadMedia(
      supabase,
      file,
      `desktop/${kind}-${Date.now()}.${extFromFile(file)}`
    );
  }

  const video = kind === "video" ? await extractVideoUpload(supabase, formData) : {};

  const { error } = await supabase
    .from("desktop_windows")
    .update({
      kind,
      title,
      content: buildContent(kind, formData),
      ...(mediaUrl ? { media_url: mediaUrl } : {}),
      ...(video.videoUrl
        ? {
            video_url: video.videoUrl,
            video_width: video.videoWidth,
            video_height: video.videoHeight,
          }
        : {}),
      is_live: formData.get("isLive") === "on",
      default_open: formData.get("defaultOpen") === "on",
      is_stream_master: formData.get("isStreamMaster") === "on",
      is_ambient_muted: formData.get("isAmbientMuted") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidateDesktopPaths();
  redirect(withFlash("/admin/desktop", `Window "${title}" saved.`));
}

export async function deleteWindow(id: string, title: string) {
  await verifySession();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("desktop_windows").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateDesktopPaths();
  redirect(withFlash("/admin/desktop", `Window "${title}" deleted.`));
}

export async function toggleWindowLive(id: string, isLive: boolean) {
  await verifySession();
  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("desktop_windows")
    .update({ is_live: isLive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateDesktopPaths();
}

export async function reorderWindow(
  id: string,
  currentOrder: number,
  direction: "up" | "down"
) {
  await verifySession();
  const supabase = await createSessionClient();

  const query = supabase.from("desktop_windows").select("id, order_index");
  const { data: neighbor } =
    direction === "up"
      ? await query
          .lt("order_index", currentOrder)
          .order("order_index", { ascending: false })
          .limit(1)
          .maybeSingle()
      : await query
          .gt("order_index", currentOrder)
          .order("order_index", { ascending: true })
          .limit(1)
          .maybeSingle();

  if (!neighbor) return;

  await supabase
    .from("desktop_windows")
    .update({ order_index: neighbor.order_index })
    .eq("id", id);
  await supabase
    .from("desktop_windows")
    .update({ order_index: currentOrder })
    .eq("id", neighbor.id);

  revalidateDesktopPaths();
}

// Moderation for the live-chat stream — visitors post via /api/stream-comments
// and the homepage shows them in real time; this just lets an admin remove one.
export async function deleteStreamComment(id: string) {
  await verifySession();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("stream_comments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateDesktopPaths();
}
