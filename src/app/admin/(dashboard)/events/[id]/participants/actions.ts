"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type RegistrationStatus = Database["public"]["Enums"]["registration_status"];

export async function updateRegistrationStatus(
  registrationId: string,
  eventSlug: string,
  status: RegistrationStatus
) {
  await verifySession();
  const supabase = await createSessionClient();

  const { error } = await supabase
    .from("event_registrations")
    .update({ status })
    .eq("id", registrationId);

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventSlug}`);
  revalidatePath("/events");
}

export async function deleteRegistration(registrationId: string, eventSlug: string) {
  await verifySession();
  const supabase = await createSessionClient();

  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("id", registrationId);

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventSlug}`);
  revalidatePath("/events");
}
