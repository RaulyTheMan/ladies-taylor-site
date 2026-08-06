"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import { uploadMedia, extFromFile } from "@/lib/admin/storage";
import { withFlash } from "@/lib/admin/flash";

const kindSchema = z.enum([
  "video",
  "article",
  "photo",
  "email",
  "document",
  "newsfeed",
]);

function revalidateDesktopPaths() {
  revalidatePath("/");
  revalidatePath("/admin/desktop/dock");
}

function parseDockFormData(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) throw new Error("Label is required.");

  const kindRaw = String(formData.get("kind") ?? "").trim();
  const kind = kindRaw ? kindSchema.parse(kindRaw) : null;
  const href = String(formData.get("href") ?? "").trim();
  const notificationRaw = String(formData.get("notificationCount") ?? "").trim();

  return {
    label,
    kind,
    // href is only meaningful when no kind is linked.
    href: kind ? null : href || null,
    notificationCount: notificationRaw ? Number(notificationRaw) : null,
    isLive: formData.get("isLive") === "on",
  };
}

// Dock apps are a fixed, permanent set of icons managed only by editing —
// there is no admin flow for creating new ones (add new icons via a
// migration/seed instead).
export async function updateDockApp(id: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();
  const data = parseDockFormData(formData);

  let iconUrl: string | undefined;
  const file = formData.get("icon");
  if (file instanceof File && file.size > 0) {
    iconUrl = await uploadMedia(
      supabase,
      file,
      `desktop/dock-${Date.now()}.${extFromFile(file)}`
    );
  }

  const { error } = await supabase
    .from("desktop_dock_apps")
    .update({
      label: data.label,
      ...(iconUrl ? { icon_url: iconUrl } : {}),
      kind: data.kind,
      href: data.href,
      notification_count: data.notificationCount,
      is_live: data.isLive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidateDesktopPaths();
  redirect(withFlash("/admin/desktop/dock", `Dock app "${data.label}" saved.`));
}

export async function deleteDockApp(id: string, label: string) {
  await verifySession();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("desktop_dock_apps").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateDesktopPaths();
  redirect(withFlash("/admin/desktop/dock", `Dock app "${label}" deleted.`));
}
