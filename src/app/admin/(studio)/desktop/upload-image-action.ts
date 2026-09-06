"use server";

import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import { uploadMedia, extFromFile } from "@/lib/admin/storage";

export async function uploadInlineImage(kind: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided.");
  }

  return uploadMedia(
    supabase,
    file,
    `desktop/${kind || "window"}/inline-${Date.now()}.${extFromFile(file)}`
  );
}
