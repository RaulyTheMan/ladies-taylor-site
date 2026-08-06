"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";

export async function updateContactStatus(id: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();

  const status = String(formData.get("status") ?? "new");
  const notes = String(formData.get("notes") ?? "");

  const { error } = await supabase
    .from("contact_submissions")
    .update({ status, notes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/leads");
}
