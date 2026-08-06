import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const MEDIA_LIBRARY_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
] as const;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — plenty for a phone photo.
export const VIDEO_MAX_SIZE_BYTES = 10 * 1024 * 1024; // matches the Server Actions body cap in next.config.ts.

export async function uploadMedia(
  supabase: SupabaseClient<Database>,
  file: File,
  path: string,
  options?: { allowedMimeTypes?: readonly string[]; maxSizeBytes?: number }
): Promise<string> {
  const allowedMimeTypes = options?.allowedMimeTypes ?? IMAGE_MIME_TYPES;
  const maxSizeBytes = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(
      `Unsupported file type${file.type ? ` "${file.type}"` : ""}. Allowed: ${allowedMimeTypes.join(", ")}.`
    );
  }

  if (file.size > maxSizeBytes) {
    throw new Error(
      `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`
    );
  }

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function extFromFile(file: File): string {
  if (file.type && MIME_TO_EXT[file.type]) return MIME_TO_EXT[file.type];
  const parts = file.name.split(".");
  return parts.length > 1 ? (parts.pop() as string).toLowerCase() : "jpg";
}
