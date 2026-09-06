"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import { uploadMedia, extFromFile } from "@/lib/admin/storage";
import { withFlash } from "@/lib/admin/flash";

const eventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(1, "Title is required."),
  eventDate: z.string().trim().optional(),
  timeLabel: z.string().trim().optional(),
  durationLabel: z.string().trim().optional(),
  location: z.string().trim().optional(),
  priceInr: z.coerce.number().int().min(0).default(0),
  hostName: z.string().trim().min(1).default("Rauly"),
  hostRole: z.string().trim().min(1).default("CEO, Ladies Taylor"),
  capacity: z.coerce.number().int().min(0).nullable().optional(),
  description: z.string().trim().default(""),
  publishedAt: z.string().trim().optional(),
});

function parseEventFormData(formData: FormData) {
  const rawCapacity = formData.get("capacity");
  const parsed = eventSchema.parse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    eventDate: formData.get("eventDate") || undefined,
    timeLabel: formData.get("timeLabel") || undefined,
    durationLabel: formData.get("durationLabel") || undefined,
    location: formData.get("location") || undefined,
    priceInr: formData.get("priceInr") || 0,
    hostName: formData.get("hostName") || "Rauly",
    hostRole: formData.get("hostRole") || "CEO, Ladies Taylor",
    capacity: rawCapacity ? rawCapacity : null,
    description: formData.get("description") || "",
    publishedAt: formData.get("publishedAt") || undefined,
  });

  const learnItems = formData
    .getAll("learnItems")
    .map((v) => String(v).trim())
    .filter(Boolean);

  return {
    ...parsed,
    learnItems,
    isPlaceholder: formData.get("isPlaceholder") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
}

function revalidateEventPaths(slug: string) {
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath("/admin/events");
}

export async function createEvent(formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();
  const data = parseEventFormData(formData);

  let coverImageUrl: string | undefined;
  const file = formData.get("coverImage");
  if (file instanceof File && file.size > 0) {
    coverImageUrl = await uploadMedia(
      supabase,
      file,
      `events/${data.slug}-${Date.now()}.${extFromFile(file)}`
    );
  }

  const { error } = await supabase.from("events").insert({
    slug: data.slug,
    title: data.title,
    event_date: data.eventDate || null,
    time_label: data.timeLabel || null,
    duration_label: data.durationLabel || null,
    location: data.location || null,
    price_inr: data.priceInr,
    host_name: data.hostName,
    host_role: data.hostRole,
    capacity: data.capacity ?? null,
    description: data.description,
    learn_items: data.learnItems,
    cover_image_url: coverImageUrl,
    published_at: data.publishedAt || null,
    is_placeholder: data.isPlaceholder,
    is_published: data.isPublished,
  });

  if (error) throw new Error(error.message);

  revalidateEventPaths(data.slug);
  redirect(withFlash("/admin/events", `Event "${data.title}" created.`));
}

export async function updateEvent(id: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();
  const data = parseEventFormData(formData);

  let coverImageUrl: string | undefined;
  const file = formData.get("coverImage");
  if (file instanceof File && file.size > 0) {
    coverImageUrl = await uploadMedia(
      supabase,
      file,
      `events/${data.slug}-${Date.now()}.${extFromFile(file)}`
    );
  }

  const { error } = await supabase
    .from("events")
    .update({
      slug: data.slug,
      title: data.title,
      event_date: data.eventDate || null,
      time_label: data.timeLabel || null,
      duration_label: data.durationLabel || null,
      location: data.location || null,
      price_inr: data.priceInr,
      host_name: data.hostName,
      host_role: data.hostRole,
      capacity: data.capacity ?? null,
      description: data.description,
      learn_items: data.learnItems,
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
      published_at: data.publishedAt || null,
      is_placeholder: data.isPlaceholder,
      is_published: data.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidateEventPaths(data.slug);
  redirect(withFlash("/admin/events", `Event "${data.title}" saved.`));
}

export async function deleteEvent(id: string, slug: string, title: string) {
  await verifySession();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateEventPaths(slug);
  redirect(withFlash("/admin/events", `Event "${title}" deleted.`));
}
