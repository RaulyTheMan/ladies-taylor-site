"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import { coerceLeadStatus } from "@/lib/admin/leadStatus";

export async function updateFormQueryStatus(id: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();

  // Coerced rather than passed through: an unknown value would otherwise fail
  // the table's CHECK constraint as a raw Postgres error.
  const status = coerceLeadStatus(formData.get("status"));
  const notes = String(formData.get("notes") ?? "");

  const { error } = await supabase
    .from("august_query_submissions")
    .update({ status, notes: notes || null })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/forms");
}
