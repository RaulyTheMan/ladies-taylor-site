"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import { coerceLeadStatus } from "@/lib/admin/leadStatus";
import { sendMetaEvent } from "@/lib/metaCapi";

export async function updateFormQueryStatus(id: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();

  // Coerced rather than passed through: an unknown value would otherwise fail
  // the table's CHECK constraint as a raw Postgres error.
  const status = coerceLeadStatus(formData.get("status"));
  const notes = String(formData.get("notes") ?? "");

  // Fetched before the update because the Meta event needs the identifiers
  // captured at submission time, and because fb_lead_sent_at tells us whether
  // this lead has already been reported.
  const { data: existing, error: fetchError } = await supabase
    .from("august_query_submissions")
    .select("status, email, phone, fbp, fbc, fb_lead_sent_at")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("august_query_submissions")
    .update({ status, notes: notes || null })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Once a lead is confirmed as a real contact, tell Meta via a separate
  // CRM-outcome event, reusing the fbp/fbc/email/phone captured at submission
  // so Meta matches it back to the original ad click regardless of the gap
  // between form-fill and follow-up.
  //
  // The condition is deliberately "is at contact and hasn't been reported"
  // rather than "is changing into contact". fb_lead_sent_at is already the
  // only guard needed against firing twice, and keying off the transition
  // stranded any lead that reached contact before this code existed: it could
  // never be reported without cycling its status to something else and back.
  if (status === "contact" && !existing.fb_lead_sent_at) {
    const sent = await sendMetaEvent({
      eventName: "QualifiedLead",
      actionSource: "system_generated",
      customData: { content_name: "August Query Form", lead_source: "august_query" },
      userData: {
        email: existing.email,
        phone: existing.phone,
        fbp: existing.fbp,
        fbc: existing.fbc,
      },
    });

    await supabase
      .from("august_query_submissions")
      .update({
        fb_lead_sent_at: new Date().toISOString(),
        fb_reported_status: sent ? "sent" : "failed",
      })
      .eq("id", id);
  }

  revalidatePath("/admin/forms");
}
