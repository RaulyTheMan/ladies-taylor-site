import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type MediaFile = {
  path: string;
  name: string;
  url: string;
  size: number | null;
  mimetype: string | null;
  updatedAt: string | null;
};

const BUCKET = "media";
const MAX_DEPTH = 3;

async function listRecursive(
  supabase: SupabaseClient<Database>,
  prefix: string,
  depth: number
): Promise<MediaFile[]> {
  if (depth > MAX_DEPTH) return [];

  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 200,
    sortBy: { column: "updated_at", order: "desc" },
  });

  if (error || !data) return [];

  const files: MediaFile[] = [];

  for (const entry of data) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;

    // Supabase Storage represents folders as entries with no metadata/id.
    const isFolder = entry.id === null;

    if (isFolder) {
      files.push(...(await listRecursive(supabase, path, depth + 1)));
      continue;
    }

    files.push({
      path,
      name: entry.name,
      url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
      size: entry.metadata?.size ?? null,
      mimetype: entry.metadata?.mimetype ?? null,
      updatedAt: entry.updated_at ?? null,
    });
  }

  return files;
}

export async function listAllMedia(
  supabase: SupabaseClient<Database>
): Promise<MediaFile[]> {
  const files = await listRecursive(supabase, "", 0);
  return files.sort((a, b) =>
    (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
  );
}
