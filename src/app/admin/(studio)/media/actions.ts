"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import {
  uploadMedia,
  MEDIA_LIBRARY_MIME_TYPES,
  VIDEO_MAX_SIZE_BYTES,
} from "@/lib/admin/storage";

export async function uploadLibraryFile(formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  await uploadMedia(supabase, file, `library/${Date.now()}-${safeName}`, {
    allowedMimeTypes: MEDIA_LIBRARY_MIME_TYPES,
    maxSizeBytes: VIDEO_MAX_SIZE_BYTES,
  });

  revalidatePath("/admin/media");
}

export async function deleteMediaFile(path: string) {
  await verifySession();
  const supabase = await createSessionClient();

  const { error } = await supabase.storage.from("media").remove([path]);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/media");
}
